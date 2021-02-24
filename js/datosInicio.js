//Variables que guardan los valores iniciales que se cargaran en los select
/**
 * @type {number[]} - Array con los años en los que hay una coincidencia con el año de algun animal registrado de la consulta a la API, sin que se repita el Año
 */
let yearDatos = [],
/**
 * @type {string[]} - Array con los nombres cientificos de cada animal registrado de la consulta a la API, sin que se repita el Nombre
 */
scientificNameDatos = [];

//funcion que se autoejecuta al cargar el window para cargar los datos actuales de la API e insertarlos en los select
/**
 * This is a function.
 *
 * @param {*} - sin parametro de entrada, solo sirve para llamarle al cargar la pagina
 *
 */
function cargarDatosIniciales(){
    /**
     * Hago una peticion a la API con los filtros necesarios para los datos que queiro cargar al inicio
     * area = 227 (Islas Canarias)
     * redList = true (para que me devuelva solo los animales pertenecientes a la lista roja)
     * size = 10000 (porque la api solo devuelve 10 valores por consulta, por lo que le paso 10000 que es el maximo de valores que puede devolver; en este caso devuelve 918)
     * 
     * Aquí el porque hago uso de solo animales a las lista roja, por que devuelve 918, si incluyera todos los demas que no están en la lista roja me devuelve un total de 30000, y 
     * la API solo me puede devolver 10000 de una consulta y no me permite hacer paginación para ir solicitando los datos siguientes a los 10000 iniciales, por lo que me faltarían 20000 datos.
    */
    fetch("https://api.obis.org/v3/occurrence?areaid=227&redlist=true&size=10000")
    .then(response => response.json())
    .then(response => {
        /**
         * Para cada elemento devuelto en la consulta agrego su año si no esta ya añadido al array yearDatos, 
         * y su nombre cientifico si no esta ya añadido al array scientificNameDatos, 
         * todo para agregarles posteriormente como option al select correspondiente
        */
        response.results.forEach(element => {
            //filto que el año no este ya dentro del array y que el año no sea undefined
            if(yearDatos.includes(element.date_year)===false && element.date_year!==undefined) yearDatos.push(element.date_year)

            //filtro que el nombre cientifico no este ya dentro del array y que el nombre cientifico no sea undefined
            if(scientificNameDatos.includes(element.scientificName)===false && element.scientificName!==undefined) scientificNameDatos.push(element.scientificName)
        });

        //Ordeno los datos
        /**
         * yearDatos lo ordeno de mayor a menor, para que se muestren los años mas recientes primero
         * Hago uso de una compareFunction, en este caso un callback
        */
        yearDatos.sort(
            /**
             * 
             * Funcion que ordena los años de mayor a menor
             * 
             * @param {number} a 
             * @param {number} b
             * 
             * @return {number} Un numero mayor, igual o menor que 0 dependiendo el resutaldo para ordenar a y b respetando los demas elementos del array
             *  
             */
            function(a, b) {
                return b - a;
            }
        );
        /**scientificNameDatos lo ordeno por orden alfabetico*/
        scientificNameDatos.sort();

        /**Tras solicitar datos a la API y almacenar y ordenar estos llamo a la funcion que agrega cada dato del array al select como un option*/
        addOptions("dateSlt", yearDatos);
        addOptions("scientificNameSlt", scientificNameDatos);
    })

}

/**
 * 
 * @param {*} domElement - es el nombre del control (select en este caso) al que quiero agregar los elementos del array
 * @param {Array.<Object>} array - es el array (objeto) que contiene los valores que hay que agregar como option al select especificado con domElement
 * 
 * @example
 * 
 *      addOptions("selectName",arrayNames)
 * 
 */
function addOptions(domElement, array){
    
    let select = document.getElementById(domElement);
     
    for(let value in array){
        let option = document.createElement("option");
        option.text = array[value];
        select.add(option);
    }
}

/**
 * Evento que se ejecuta al cargar el windows y ejecuta la funcion cargarDatosIniciales
 */
window.onload=cargarDatosIniciales;