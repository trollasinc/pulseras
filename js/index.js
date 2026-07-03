import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdCz5E_n_1oxXVz8OxTyxAyUdj3riiAWw",
  authDomain: "puesto-de-pulseras.firebaseapp.com",
  projectId: "puesto-de-pulseras",
  storageBucket: "puesto-de-pulseras.appspot.com",
  messagingSenderId: "397240883095",
  appId: "1:397240883095:web:54d64675313e0b326396d2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("products");
const modal = document.getElementById("modal");

let selectedProduct = null;

onSnapshot(collection(db, "productos"), (snap) => {
  container.innerHTML = "";

  snap.forEach((docSnap) => {
    const p = docSnap.data();

    const div = document.createElement("div");

    div.innerHTML = `
            <img src="${p.image}" width="120" />
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <b>${p.price} €</b>
            <button class="reserve">RESERVAR</button>
          `;

    div.querySelector(".reserve").onclick = () => {
      selectedProduct = {
        id: docSnap.id,
        ...p,
      };
      modal.style.display = "block";
    };

    container.appendChild(div);
  });
});

document.getElementById("close").onclick = () => {
  modal.style.display = "none";
};

document.getElementById("send").onclick = async () => {
  const data = {
    productId: selectedProduct?.id || null,
    productName: selectedProduct?.name || null,
    name: document.getElementById("r_name").value,
    lastname: document.getElementById("r_lastname").value,
    phone: document.getElementById("r_phone").value,
    email: document.getElementById("r_email").value,
    parcel: document.getElementById("r_parcel").value,
    datetime: document.getElementById("r_datetime").value,
    created: Date.now(),
  };

  if (!data.name || !data.lastname || !data.parcel || !data.datetime) return;

  await addDoc(collection(db, "reservas"), data);

  alert("Gracias por tu reserva ✨♥️");

  modal.style.display = "none";
};
