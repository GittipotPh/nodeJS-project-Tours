import { showAlert } from "./alert.js";
import axios from 'axios';

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
            
    
    });

    if (res.data.status === 'success') {
        location.reload(true);
        location.href = '/login';
    }

    }catch (err) {
        console.log(err.response);
        showAlert('error', 'Error logging out Try Again');


    }
};








// import { showAlert } from "./alert.js";


// const logout = async () => {
//     try {
//         const res = await axios({
//             method: 'GET',
//             url: 'http://127.0.0.1:3000/api/v1/users/logout'
            
    
//     });

//     if (res.data.status === 'success') {
//         location.reload(true);
//         location.href = '/login';
//     }

//     }catch (err) {
//         console.log(err.response);
//         showAlert('error', 'Error logging out Try Again');


//     }
// };

// document.querySelector('.nav__el--logout').addEventListener('click', logout);


