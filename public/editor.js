var app = angular.module('editor', ['firebase']);

function setLoading() {
  document.getElementById(`loading`).className = ''
  document.getElementById(`editor`).className = 'hidden'
}

function unsetLoading() {
  document.getElementById(`loading`).className = 'hidden'
  document.getElementById(`editor`).className = ''
}

app.controller('controller', function($scope) {
  $scope.database = firebase.database()
  $scope.editor = new MediumEditor('.editable', {
    buttonLabels: 'fontawesome'
  })
  $scope.editor.subscribe('editableInput', function (event, editable) { //capture dom event
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

  $scope.update = function() { //interop angular with vanilla js TODO engineer a medium listener
    console.log("writing to db ...")
    $scope.writeToDoc({
      title:     document.getElementById('medium-title').innerHTML.trim(),
      subtitle:  document.getElementById('medium-subtitle').innerHTML.trim(),
      quote:     document.getElementById('medium-quote').innerHTML.trim(),
      paragraph: document.getElementById('medium-paragraph').innerHTML.trim()
    })
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
