

function validateEmail(){
    var email = document.getElementsByName("email")[0].value;
    var error = document.getElementById("error-mail");
   

   
}

  function validatename(){
    var name=document.getElementsByName("name")[0].value
    var error=document.getElementById("error-name");
    var namestatus = /^[A-Za-z\s]+$/;
  
   if(name.length<3){
      error.innerHTML="name invalid"
      error.style.color="red"
      return false;
    }else if(name.match(namestatus)){
      error.innerHTML="";
      error.style.color="green";
      return true;
    }else{
      error.innerHTML="name invalid"
      error.style.color="red"
      return false;
    }
  }

  
function validatepassword(){
    var pass=document.getElementsByName("password")[0].value
    var error=document.getElementById("error-password");
    var passstatus= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/
  
  
    if(pass.length===0){
        error.innerHTML="must be min 8 characters"
        error.style.color="red";
        return false;
    }else if(pass.length<8){
        error.innerHTML="must be min 8 characters"
        error.style.color="red";
        return false;
    }else if(!pass.match(passstatus)){
        error.innerHTML="must contain uppercase,lowercase,number,special characters"
        error.style.color="red";
        return false;
    }else{
        error.innerHTML="";
        error.style.color="green";
        return true;
    
    }
  }
  
  function validatePhone(){
    var pass=document.getElementsByName("phone")[0].value
    var error=document.getElementById("error-phone");
    var passstatus= /^[0-9]{10}$/;

  
  
    if(pass.length<10){
        error.innerHTML="Invalid Number"
        error.style.color="red";
        return false;
    
    }else if(!pass.match(passstatus)){
        error.innerHTML="Invalid Number"
        error.style.color="red";
        return false;
        
    }else{
        error.innerHTML="";
        error.style.color="green";
        return true;
    
    }
  }


function userUnlist(userId) {
    console.log('haaai');
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You want to block the user!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Block user!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
       
        if (result.isConfirmed) {
              window.location.href = `useraction/${userId}/0`
            fetch(`useraction/${userId}/0`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `useraction/${userId}/0`
                    swalWithBootstrapButtons.fire(
                        'Blocked!',
                        'Your user has been blocked.',
                        'success'
                    )
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Something went wrong!',
                        'error'
                    )
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'The user stays as Active :)',
                'error'
            )
        }
    });
}


function userAddList(userId) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You want to unblock the user",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, unblock!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        
        if (result.isConfirmed) {
            window.location.href = `useraction/${userId}/1`
            fetch(`useraction/${userId}/1`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                   
                    swalWithBootstrapButtons.fire(
                        'Unblocked!',
                        'The user has been unblocked.',
                        'success'
                    )
                    
                } else {
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Something went wrong!',
                        'error'
                    )
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'The user stays as blocked :)',
                'error'
            )
        }
    });
}


//products add products validation
function validateProductName(){
    var name=document.getElementsByName("productName")[0].value
    var error=document.getElementById("error-pname");
    var namestatus = /^[A-Za-z]||[0-9]+$/;
    var str =name
    var trimmedStr = str.replace(/\s/g, '');

    if(trimmedStr<3){
        error.innerHTML="Enter the name !"
      error.style.color="red"
      return false;
    }
  
   if(name.length==0){
      error.innerHTML="Enter the name "
      error.style.color="red"
      return false;
    }else if(name.length<3){
      error.innerHTML="name invalid"
      error.style.color="red"
      return false;
    }
        else if(name.match(namestatus)){
      error.innerHTML="";
      error.style.color="green";
      return true;
    }else{
      error.innerHTML="name invalid "
      error.style.color="red"
      return false;
    }
  }

  function validateDescription2(){
    var description2=document.getElementsByName("description2")[0].value
    var namestatus = /^[A-Za-z]||[0-9]+$/;
    var error=document.getElementById("error-description2");
    var str =description2
    var trimmedStr = str.replace(/\s/g, '');

    if(trimmedStr==''){
        error.innerHTML="The description must contain atleast 30 words "
      error.style.color="red"
      return false;
    }
  

  
   if(description2.length<30){
      error.innerHTML="The description must contain atleast 30 words "
      error.style.color="red"
      return false;
    
    }else{
      error.innerHTML=""
      error.style.color="red"
      return false;
    }
  }

  function validateDescription() {
    var description = document.getElementsByName("description")[0].value;
    var error = document.getElementById("error-description");
    var trimmedStr = description.replace(/\s/g, '');

    if (trimmedStr === '') {
        error.innerHTML = "The description must contain at least 30 characters";
        error.style.color = "red";
        return false;
    }

    if (description.length < 30) {
        error.innerHTML = "The description must contain at least 30 characters";
        error.style.color = "red";
        return false;
    } else {
        error.innerHTML = ""; // Reset the error message if the description is valid
        return true;
    }
}


  function userExist(){
    Swal.fire({
   icon: 'error',
   title: 'Oops...',
   text: 'You already have an account!',
   footer: '<a href="/login">You can login to your account </a>'
 })
}
function confirmOrder(){
    Swal.fire({
     
        icon: 'success',
        title: 'Order Placed',
        showConfirmButton: false,
        timer: 1500
      })
}

function confirm(){
    Swal.fire({
     
        icon: 'success',
        title: 'Product status updated',
        showConfirmButton: false,
        timer: 1500
      })
}
function confirmStatus(){
    Swal.fire({
        icon: 'success',
        title: 'Order status updated',
        showConfirmButton: false,
        timer: 1500
      })
}

function categoryExist(){
     
Swal.fire('This Category already exist!')
}

function invalidEntry(){
     
    Swal.fire('Invalid Entry!')
    }
    
function  userNotExist(){
     
 Swal.fire({
    icon: 'error',
    text:'User not exist in the Email!',
    footer:'<a href="/register">Create an account </a>'
})
}
function invalidNumber(){
    Swal.fire({
   icon: 'error',
   title: 'Oops...',
   text: `Cant't send OTP,
           Try again after sometime`,
  
 })
}

function invalidOTP(){
    Swal.fire({
        icon: 'error',
        text: 'Invalid OTP',
       
      })
}

function invalidPhone(){
    Swal.fire({
        icon: 'error',
        text: 'Invalid OTPYour One-Time Password (OTP) can take several minutes to reach your phone. If you are not receiving it, check that the phone number shown is correct.',
       
      })
}

function wishlistExist(){
    Swal.fire({
    title: 'Product Already In Wishlist',
    text: 'This product is already in your wishlist.',
    icon: 'info',
})
}

//cart remove swal
function cartRemove(ProductId,index) { 
       try {
        
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You want to remove the product?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes,remove !',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then((result) => {
        
        if (result.isConfirmed) {
            swalWithBootstrapButtons.fire(
                'Removed!',
                'Your Product has been removed',
                'success'
            ).then((result)=>{
                if(result.isConfirmed){
                window.location.href = `/removeitem-cart?productId=${ProductId}&index=${index}`
                }
            })
               
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
                'Cancelled',
                'The products stays in cart :)',
                'error'
            )
        }
    });
} catch (error) {
 console.log(error.message);       
}
}

//admin
function cancelOrder(orderId) { 
    try {
     
 const swalWithBootstrapButtons = Swal.mixin({
     customClass: {
         confirmButton: 'btn btn-success',
         cancelButton: 'btn btn-danger'
     },
     buttonsStyling: false
 });

 swalWithBootstrapButtons.fire({
     title: 'Are you sure?',
     text: "You want to cancel the Order?",
     icon: 'warning',
     showCancelButton: true,
     confirmButtonText: 'Yes!',
     cancelButtonText: 'No',
     reverseButtons: true
 }).then((result) => {
     
     if (result.isConfirmed) {
         swalWithBootstrapButtons.fire(
             'Cancelled!',
             'Your Order has been Cancelled',
             'success'
         ).then((result)=>{
             if(result.isConfirmed){
             window.location.href = `cancelorder?OID=${orderId}`
             }
         })
            
     } 
 });
} catch (error) {
console.log(error.message);       
}
}

function userCancelOrder(orderId){
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Cancel it!"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Cancelled!",
                text: "Your order has been cancelled.",
                icon: "success"
            }).then((result2) => {
                if (result2.isConfirmed) {
                    window.location.href = `usercancelorder?OID=${orderId}`;
                }
            });
        }
    });
}

function userReturnOrder(orderId){
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Return It!"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Returned!",
                text: "Your order will collected by our staff.",
                icon: "success"
            }).then((result2) => {
                if (result2.isConfirmed) {
                    window.location.href = `userreturnorder?OID=${orderId}`;
                }
            });
        }
    });
}

function avoidSpace(){
    Swal.fire({
   icon: 'error',
   title: 'Oops...',
   text: `Avoid WhiteSpaces,
           Re Enter The Code`,
  
 })
}
function couponExist(){
    Swal.fire({
    title: 'Coupon Code Already Exist',
    text: 'This coupon is already in your website.',
    icon: 'info',
})
}

function categoryAction0(catId) {
    Swal.fire({
        title: "Are you sure?",
        text: `Products under this category will be unlisted from the users !`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Deleted!",
            text: "Your category has been deleted.",
            icon: "success"
          }).then((result2)=>{
            if(result2.isConfirmed){
                window.location.href = `categoriesaction/${catId}/0`;
            }
          })
        }
      });
}

function categoryAction1(catId) {
    Swal.fire({
        title: "Are you sure?",
        text: `Products under this category will be unblocked from the users !`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, unblock it!"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Unblocked!",
            text: "Your category has been unblocked.",
            icon: "success"
          }).then((result2)=>{
            if(result2.isConfirmed){
                window.location.href = `categoriesaction/${catId}/1`;
            }
          })
        }
      });
}

function brandAction0(Id) {
    Swal.fire({
        title: "Are you sure?",
        text: `Products under this brand will be unlisted from the users !`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, block it!"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "blocked!",
            text: "Your brand has been deleted.",
            icon: "success"
          }).then((result2)=>{
            if(result2.isConfirmed){
                window.location.href = `brandaction?id=${Id}&act=0`;
            }
          })
        }
      });
}

function brandAction1(Id) {
    Swal.fire({
        title: "Are you sure?",
        text: `Products under this brand will be unblocked from the users !`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, unblock it!"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Unblocked!",
            text: "Your brand has been unblocked.",
            icon: "success"
          }).then((result2)=>{
            if(result2.isConfirmed){
                window.location.href = `brandaction?id=${Id}&act=1`;
            }
          })
        }
      });
}