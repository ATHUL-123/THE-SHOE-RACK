function userExist() {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You already have an account!',
        footer: '<a href="">You can login to your account </a>'
      })
}

module.exports={
    userExist
}