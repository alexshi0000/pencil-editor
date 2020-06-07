function passwordRequirements(password) {
  return password.length >= 8; //basic pass
}

var app = angular.module('landing', ['firebase'])
app.controller('controller', function($scope) {
  $scope.email = "";
  $scope.password = "";
  $scope.createUser = function() {
    if (passwordRequirements($scope.password)) { //valid
      firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.password)
	.catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code
	  var errorMessage = error.message
	  console.log(`${errorCode} ${errorMessage}`)
	})
    }
  }
  $scope.loginUser = function() {
    firebase.auth().signInWithEmailAndPassword($scope.email, $scope.password)
      .catch(function(error) {
	var errorCode = error.code;
	var errorMessage = error.message;
	  console.log(`${errorCode} ${errorMessage}`)
      });
  }

  //user is logged in
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      window.location.replace('/editor.html')
    }
  })
});
