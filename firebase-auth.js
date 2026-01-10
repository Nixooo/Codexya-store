// ==========================================
// CONFIGURACIÓN DE FIREBASE
// ==========================================
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto.
// 3. Ve a "Configuración del proyecto" (engranaje) > General.
// 4. Baja hasta "Tus apps" y selecciona el icono de web (</>).
// 5. Registra la app y copia el objeto "firebaseConfig".
// 6. REEMPLAZA todo el objeto de abajo con el tuyo.

const firebaseConfig = {
    apiKey: "AIzaSyB59e_EE6n7Jt_rrCxyXLljIJDe7PBWa2c",
    authDomain: "codexya-store.firebaseapp.com",
    projectId: "codexya-store",
    storageBucket: "codexya-store.firebasestorage.app",
    messagingSenderId: "262080214782",
    appId: "1:262080214782:web:1d513f5b8291ebd5a457af"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// ==========================================
// LÓGICA DE AUTENTICACIÓN
// ==========================================

// Función para mostrar errores de forma amigable
function showError(error) {
    let message = error.message;
    
    // Traducir errores comunes de Firebase
    if (error.code === 'auth/user-not-found') message = 'No existe una cuenta con este correo.';
    if (error.code === 'auth/wrong-password') message = 'Contraseña incorrecta.';
    if (error.code === 'auth/email-already-in-use') message = 'Este correo ya está registrado.';
    if (error.code === 'auth/weak-password') message = 'La contraseña debe tener al menos 6 caracteres.';
    if (error.code === 'auth/invalid-email') message = 'El correo electrónico no es válido.';
    
    alert(message);
}

// 1. REGISTRO DE USUARIOS
async function registerUser(email, password, name) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Actualizar el perfil con el nombre
        await user.updateProfile({
            displayName: name
        });

        alert(`¡Bienvenido, ${name}! Tu cuenta ha sido creada.`);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error en registro:", error);
        showError(error);
    }
}

// 2. INICIO DE SESIÓN
async function loginUser(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // El observador onAuthStateChanged manejará la redirección si es necesario,
        // pero para UX inmediata podemos redirigir aquí.
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error en login:", error);
        showError(error);
    }
}

// 3. INICIO DE SESIÓN CON GOOGLE
async function googleLogin() {
    try {
        await auth.signInWithPopup(provider);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error en Google login:", error);
        showError(error);
    }
}

// 4. RECUPERAR CONTRASEÑA
async function resetPassword(email) {
    if (!email) {
        alert("Por favor, ingresa tu correo electrónico en el campo y vuelve a hacer clic en '¿Olvidaste tu contraseña?'.");
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        alert(`Se ha enviado un correo de recuperación a ${email}. Revisa tu bandeja de entrada.`);
    } catch (error) {
        console.error("Error en reset password:", error);
        showError(error);
    }
}

// 5. CERRAR SESIÓN
async function logout() {
    try {
        await auth.signOut();
        alert("Has cerrado sesión correctamente.");
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
}

// ==========================================
// OBSERVADOR DE ESTADO (Se ejecuta al cargar la página)
// ==========================================
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("Usuario autenticado:", user.email);
        localStorage.setItem('isLoggedIn', 'true'); // Mantener compatibilidad con script.js existente
        
        // Actualizar UI si estamos en index.html u otra página principal
        updateUserUI(user);
    } else {
        console.log("No hay usuario activo");
        localStorage.setItem('isLoggedIn', 'false');
        updateUserUI(null);
    }
});

function updateUserUI(user) {
    // Buscar el botón de usuario en el header
    const userBtn = document.querySelector('.user-btn');
    if (userBtn) {
        if (user) {
            // Usuario logueado: Cambiar icono o comportamiento
            userBtn.innerHTML = `
                <div style="background: var(--primary-color); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
            `;
            userBtn.href = "#"; // Prevenir navegación por defecto
            userBtn.onclick = (e) => {
                e.preventDefault();
                if(confirm(`Hola ${user.displayName || user.email}. ¿Deseas cerrar sesión?`)) {
                    logout();
                }
            };
            userBtn.setAttribute('aria-label', 'Perfil de Usuario');
        } else {
            // Usuario no logueado: Restaurar botón original
            userBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 18C3 14 6.5 12 10 12C13.5 12 17 14 17 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
            userBtn.href = "login.html";
            userBtn.onclick = null;
            userBtn.setAttribute('aria-label', 'Iniciar Sesión');
        }
    }
}
