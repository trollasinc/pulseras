import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
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
const auth = getAuth(app);
const db = getFirestore(app);

const loginBox = document.getElementById("login-box");
const panel = document.getElementById("admin-panel");

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert("Login fallido 💀");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.style.display = "none";
    panel.style.display = "block";
  } else {
    loginBox.style.display = "block";
    panel.style.display = "none";
  }
});

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "productos");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/odhy8ulw/image/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await res.json();
  return data.secure_url;
}

const list = document.getElementById("list");

document.getElementById("add").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const desc = document.getElementById("desc").value;
  const price = document.getElementById("price").value;
  const file = document.getElementById("image").files[0];

  if (!name || !file) return;

  const url = await uploadImage(file);

  await addDoc(collection(db, "productos"), {
    name,
    desc,
    price,
    image: url,
    created: Date.now(),
  });
});

onSnapshot(collection(db, "productos"), (snap) => {
  list.innerHTML = "";

  snap.forEach((p) => {
    const data = p.data();

    const div = document.createElement("div");

    div.innerHTML = `
      <img src="${data.image}" width="80" />
      <b>${data.name}</b>
      <p>${data.desc}</p>
      <p>${data.price} €</p>
      <button>Eliminar</button>
    `;

    div.querySelector("button").onclick = async () => {
      await deleteDoc(doc(db, "productos", p.id));
    };

    list.appendChild(div);
  });
});

const orders = document.getElementById("orders");

onSnapshot(collection(db, "reservas"), (snap) => {
  orders.innerHTML = "";

  snap.forEach((r) => {
    const data = r.data();

    const div = document.createElement("div");

    div.innerHTML = `
      <p style="color:${data.done ? "limegreen" : "red"};font-weight:bold;">
        ${data.done ? "HECHO" : "PENDIENTE"}
      </p>

      <p>${data.productName || "Sin producto"}</p>
      <p>${data.name} ${data.lastname}</p>
      <p>${data.parcel}</p>
      <p>${data.datetime}</p>

      ${data.done ? "" : `<button class="done-btn">HECHO</button>`}
    `;

    if (!data.done) {
      div.querySelector(".done-btn").onclick = async () => {
        await updateDoc(doc(db, "reservas", r.id), {
          done: true,
        });
      };
    }

    orders.appendChild(div);
  });
});
