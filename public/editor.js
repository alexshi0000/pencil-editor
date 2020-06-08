var app = angular.module('editor', ['firebase']);

app.controller('controller', function($scope) {
  $scope.database = firebase.database()
  $scope.editor = new MediumEditor('.editable')

  $scope.writeToDoc = function(doc) {
    $scope.database.ref(`user/${$scope.user.uid}/document/1`).set(doc);
  }

  $scope.init = function(doc) {
    //document.getElementById(`loading`).className = ''
    //document.getElementById(`editor`).className = 'hidden'
    $scope.database.ref(`user/${$scope.user.uid}/document/1`).once('value')
      .then(function(snapshot) {
	//mock
	let throttle = Math.floor(Math.random() * 1000)
	setTimeout(load, 1000 + throttle)
	function load() {
	  //document.getElementById(`loading`).className = 'hidden'
	  //document.getElementById(`editor`).className = ''
	  document.getElementById('medium-title').innerHTML = snapshot.val().title
	  document.getElementById('medium-paragraph').innerHTML = snapshot.val().paragraph
	}
      });
  }

  $scope.update = function() {
    $scope.title = document.getElementById('medium-title').innerHTML.trim()
    $scope.paragraph = document.getElementById('medium-paragraph').innerHTML.trim()
    $scope.writeToDoc({
      title: $scope.title,
      paragraph: $scope.paragraph
    })
  }

  $scope.signOutUser = function() {
    $scope.update() //update
    firebase.auth().signOut()
      .catch(function(error) {
	console.log(error)
      });
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
