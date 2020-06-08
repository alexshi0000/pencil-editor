var app = angular.module('editor', ['firebase']);

function setLoading() {
  document.getElementById(`loading`).className = ''
  document.getElementById(`editor`).className = 'hidden'
}

function unsetLoading() {
  document.getElementById(`loading`).className = 'hidden'
  document.getElementById(`editor`).className = ''
  anim.play() //play aniamtion
}

app.controller('controller', function($scope) {
  $scope.database = firebase.database()
  $scope.editor = new MediumEditor('.editable', {
    buttonLabels: 'fontawesome',
    placeholder: false,
  })
  $scope.editor.subscribe('editableInput', function (event, editable) { //capture dom event
    $scope.parseLatex() //parse our latex
    $scope.update() //custom update function
  });

  //init
  $scope.init = function(doc) {
    //consts
    $scope.email = firebase.auth().currentUser.email
    $scope.date = new Date().toString().substring(4,16)
    setLoading()
    $scope.database.ref(`user/${$scope.user.uid}/document/1`).once('value')
      .then(function(snapshot) {
	//mock
	let throttle = Math.floor(Math.random() * 750)
	setTimeout(load, 750 + throttle)
	function load() {
	  unsetLoading()
	  $scope.readFromDoc(snapshot)
	}
      });
    $scope.$apply()
  }

  $scope.readFromDoc = function(snapshot) {
    if (!snapshot.val())
      return
    if (snapshot.val().title !== null     &&
	snapshot.val().subtitle !== null  &&
	snapshot.val().quote !== null     &&
	snapshot.val().paragraph !== null
    ) {
      //interop with vanilla.js maybe switch this over to angularJS in future
      document.getElementById('medium-title').innerHTML     = snapshot.val().title
      document.getElementById('medium-subtitle').innerHTML  = snapshot.val().subtitle
      document.getElementById('medium-quote').innerHTML     = snapshot.val().quote
      document.getElementById('medium-paragraph').innerHTML = snapshot.val().paragraph
    }
  }

  $scope.writeToDoc = function(doc) {
    $scope.database.ref(`user/${$scope.user.uid}/document/1`).set(doc);
    //1 placeholder - each user only has 1 document currently supported
  }

  $scope.update = function() {
    $scope.writeToDoc({
      title:     document.getElementById('medium-title').innerHTML.trim(),
      subtitle:  document.getElementById('medium-subtitle').innerHTML.trim(),
      quote:     document.getElementById('medium-quote').innerHTML.trim(),
      paragraph: document.getElementById('medium-paragraph').innerHTML.trim()
    })
  }

  $scope.parseLatex = function() {
    let paragraph = document.getElementById('medium-paragraph').innerHTML
    let start = 0, end = 0
    for (let i = 0; i < paragraph.length; i++) {
      if (paragraph.charAt(i) === '$' && start === 0) {
	start = i
      } else if (paragraph.charAt(i) === '$') {
	end = i;
	break
      }
    }
    if (end > start) { //only render if valid enclosings
      let latexSpan = ` <img src="http://latex.codecogs.com/gif.latex?${paragraph.substring(start+1, end)}" border="0"/> `
      paragraph = paragraph.substring(0, start) + latexSpan + paragraph.substring(end+1, paragraph.length)
      document.getElementById('medium-paragraph').innerHTML = paragraph
      console.log(latexSpan)
    }
  }

  $scope.signOutUser = function() {
    setLoading()
    let throttle = Math.floor(Math.random() * 750) //test loading state via throttling
    setTimeout(load, 750 + throttle)
    function load() {
      $scope.update() //update
      firebase.auth().signOut()
	.catch(function(error) {
	  console.log(error)
	});
    }
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $scope.user = user
      $scope.init()
    } else {
      window.location.replace('/')
    }
  })
})
