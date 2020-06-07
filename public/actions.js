function passwordRequirements(password) {
  return password.length >= 8
}

function passwordMatches(password, password2) {
  return password === password2
}

const errorLabels = {
  'invalid-email'        : '*Provide a valid email',
  'email-already-in-use' : '*Email already in use',
  'invalid-pass'         : '*Requirements not met',
  'pass-mismatch'        : '*Passwords must match'
}

var app = angular.module('landing', ['firebase'])
app.controller('controller', function($scope) {
  //models
  $scope.email = ''
  $scope.password = ''

  $scope.createUser = function() {
    //reset
    $scope.validPassword = ''
    $scope.passwordsMatch = ''
    $scope.validEmail = ''
    //test
    if (!passwordRequirements($scope.password))
      $scope.validPassword = errorLabels['invalid-pass']
    if ($scope.password !== $scope.password2)
      $scope.passwordsMatch = errorLabels['pass-mismatch']
    //post
    if (passwordRequirements($scope.password) && $scope.password === $scope.password2) {
      firebase.auth().createUserWithEmailAndPassword($scope.email, $scope.password)
	.then(function() {
	  console.log('success')
	})
	.catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code
	  var errorMessage = error.message
	  if (errorCode === 'auth/email-already-in-use') {
	    $scope.validEmail = errorLabels['email-already-in-use']
	    $scope.$apply()
	  }
	  if (errorCode === 'auth/invalid-email') {
	    $scope.validEmail = errorLabels['invalid-email']
	    $scope.$apply()
	  }
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
