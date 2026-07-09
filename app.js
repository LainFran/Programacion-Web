// 1. Configurar e Inicializar el cliente de Supabase
const SUPABASE_URL = 'https://eskxlzbqqicxygxffxqg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wpCxaVbzMMzHHXfWLeFNFA_bWSoAdDi';

// CORRECCIÓN: Inicialización limpia usando el objeto global de la CDN
// Asegúrate de que esta línea esté escrita exactamente así en tu app.js:
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// 2. Función para obtener los estudiantes de la BD y pintarlos en pantalla
async function obtenerDirectorio() {
    const { data: estudiantes, error } = await supabaseClient
        .from('estudiantes_webs')
        .select('*')
        .eq('activo', true)
        .order('nombre_estudiante', { ascending: true });

    if (error) {
        console.error('Error al conectar con Supabase:', error);
        document.getElementById('contenedor-estudiantes').innerHTML = 
            `<p class="mensaje-error">Error al cargar datos: ${error.message}</p>`;
        return;
    }

    // Actualizar el contador con formato digital de dos dígitos
    const total = estudiantes.length;
    const elementoContador = document.getElementById('contador-total');
    if (elementoContador) {
        elementoContador.textContent = total < 10 ? `0${total}` : total;
    }

    // CORRECCIÓN: Volvimos a capturar el contenedor y a limpiar el "Cargando..."
    const contenedor = document.getElementById('contenedor-estudiantes');
    contenedor.innerHTML = ''; 

    if (estudiantes.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">Aún no hay proyectos registrados. ¡Sé el primero!</p>';
        return;
    }

    // Dibujar las tarjetas usando un bucle iterativo
    estudiantes.forEach(alumno => {
        contenedor.innerHTML += `
            <div class="tarjeta-alumno">
                <h3>${alumno.nombre_estudiante}</h3>
                <p class="descripcion">${alumno.descripcion_proyecto || 'Sin descripción disponible.'}</p>
                <div class="enlaces-contenedor">
                    <a href="${alumno.url_pagina}" target="_blank" class="btn btn-web">Visitar Sitio</a>
                    <a href="${alumno.url_repositorio}" target="_blank" class="btn btn-repo">Ver Código</a>
                </div>
            </div>
        `;
    });
}

// 3. Escuchar el envío del formulario para guardar datos
document.getElementById('formulario-registro').addEventListener('submit', async (e) => {
    e.preventDefault(); // Detener la recarga nativa de la página

    // Capturar valores ingresados por el usuario
    const nombre = document.getElementById('nombre').value.trim();
    const urlWeb = document.getElementById('url_web').value.trim();
    const urlRepo = document.getElementById('url_repo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();

    // Buscar el botón dentro del formulario para efectos visuales
    const boton = document.querySelector('.seccion-registro button[type="submit"]');
    if (boton) {
        boton.textContent = 'Guardando...';
        boton.disabled = true;
    }

    // Guardar registro en Supabase
    const { error } = await supabaseClient
        .from('estudiantes_webs')
        .insert([
            { 
                nombre_estudiante: nombre, 
                url_pagina: urlWeb, 
                url_repositorio: urlRepo, 
                descripcion_proyecto: descripcion || null
            }
        ]);

    if (boton) {
        boton.textContent = 'Registrar mi Proyecto';
        boton.disabled = false;
    }

    if (error) {
        alert('Hubo un inconveniente al guardar: ' + error.message);
        console.error(error);
    } else {
        alert('¡Tu proyecto se registró exitosamente!');
        document.getElementById('formulario-registro').reset(); // Limpiar el formulario
        obtenerDirectorio(); // Actualizar la lista al instante sin recargar la página
    }
});

// 4. Arrancar la carga de datos al iniciar el sitio web
document.addEventListener('DOMContentLoaded', obtenerDirectorio);
