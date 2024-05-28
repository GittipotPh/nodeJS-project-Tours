
import { showAlert } from "./alert.js";
import axios from 'axios';

export const login = async (email , password) => {
    console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password 
            },
                withCredentials: true
    });

    if (res.data.status === 'success') {
        showAlert('success','Logged in successfully');
        window.setTimeout(() => {
            location.assign('/'), 1500
        });
    };

    } catch (err) {
        showAlert('error','Login failed');
    }

};











// import { showAlert } from "./alert.js";

// const login = async (email , password) => {
//     console.log(email, password);
//     try {
//         const res = await axios({
//             method: 'POST',
//             url: 'http://127.0.0.1:3000/api/v1/users/login',
//             data: {
//                 email,
//                 password 
//             },
//                 withCredentials: true
//     });

//     if (res.data.status === 'success') {
//         showAlert('success','Logged in successfully');
//         window.setTimeout(() => {
//             location.assign('/'), 1500
//         });
//     };

//     } catch (err) {
//         showAlert('error',err.response.data.message);
//     }

// };




// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault();

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email, password);
// });

