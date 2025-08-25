// Firebase initialization and contact save helper (ESM)
// Uses Firebase v12 ESM CDN endpoints

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getDatabase, ref, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDi6kBfcNbQIpixKTqbN9U5f3D-5BebZAs',
  authDomain: 'contactform-portfolio-2660d.firebaseapp.com',
  databaseURL: 'https://contactform-portfolio-2660d-default-rtdb.firebaseio.com',
  projectId: 'contactform-portfolio-2660d',
  storageBucket: 'contactform-portfolio-2660d.firebasestorage.app',
  messagingSenderId: '194856759330',
  appId: '1:194856759330:web:6aac88ac71d6dc51309a7b'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Save contact form submission to Realtime Database
export async function saveContact(data) {
  // data: { name, email, subject, message }
  const doc = { ...data, createdAt: serverTimestamp() };
  const contactsRef = ref(db, 'contacts');
  await push(contactsRef, doc);
}

// Expose for non-module scripts if needed
// eslint-disable-next-line no-undef
window.ContactAPI = { saveContact };
