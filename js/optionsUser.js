/**
 * Importo el array de objetos para la consulta de imagenes, aunque esta opcion es mas sucia, me hace modificar menos el resto del codigo.
 * A diferencia que haciendolo con un fetch sobre un archivo imagenes.json donde tengo que modificar cada parte del codigo con await y async por la que pase
 * algun fragmento o return del metodo devolverImagen
 */
import datosImg from '../imagenes.js';

//Capturo los elementos del div getOptionUser para trabajar con los filtros que aplique el usuario
/*const yearDom = $("#dateSlt"),
scientificNameDom = $("#scientificNameSlt"),*/
/**
 * @const {Object} - constante que hace referencia al boton de enviar la peticion para solicitar los datos a la API
 */
const boton = document.getElementById("enviarBtn");

/**
 * Listener del boton
 */
boton.addEventListener('click',function(){

    //Para vaciar los datos existentes, para que se muestren los siguientes resultados
    $("#datos").empty();
    //Tras dar al boton agrego una imagen con un texto para la carga de la consulta
    $("#datos").append("<div style='margin:0 auto; display:flex; flex-direction:column; justify-content:center;align-items:center'><p>Solicitando datos, espera.....</p><br/><img src='./images/surf.gif'/></div>")
    /**
     * @type {Object} - valdra para obtener el valor en texto del elemento que haya elegido el usuario del select equivalente al Año una vez cargardos previamente todas las opciones
     */
    let yearDomSelect = $("#dateSlt option:selected").text();
    /**
     * @type {Object} - valdra para obtener el valor en texto del elemento que haya elegido el usuario del select equivalente al Nombre Cientifico una vez cargardos previamente todas las opciones
     */
    let scientificNameDomSelect = $("#scientificNameSlt option:selected").text();
    /**
     * @type {string} - correspondera a la cadena que agregaremos en la consulta a la API cuando se filtre por Nombre Cientifico
     */
    let scientificNameMostrar;
    /**
     * @type {Array.<Object>} - se espera que este array se llene de objetos, cada uno por una Animal que devuelva la consulta, lo usaremos para guardar los Animales que pasen las cribas que hagamos
     */
    let bichos = [];

    //Solo se crea scientificNameMostrar cuando este contenga un espacio, lo que es decir contenga mas de dos palabras
    if(scientificNameDomSelect.includes(" ")){
        let palabras = scientificNameDomSelect.split(" ");
        /*
         * Podria haber creado un forEach y recorrer todo el array palabras por si existieran scientificNames con mas de 2 palabras,
         * para agregarle tambien entre medias de estas el %20 para la consulta, pero fijandome en todos los datos con los que trabajo
         * solo existen de dos palabras y lo he hecho asi para que sea mas sencillo, aunque la otra opcion seria escalable con un volumen
         * de datos mas grande, donde podriamos controlar todos los nombres sin saber como son estos
        */
        scientificNameMostrar = palabras[0]+"%20"+palabras[1];
    }

    //En caso que se quieran todos los datos disponibles a la API, de todos los años de todos los Animales existentes en la lista roja dentro del area de las Islas Canarias
    if(yearDomSelect==="Todos" && scientificNameDomSelect==="Todos"){
        fetch("https://api.obis.org/v3/occurrence?areaid=227&redlist=true&size=1000")
        .then(response => response.json())
        .then(response => {
            //En esta combinaciones de opciones, me ahorro el forEach solamente ordenando el array results que da la consulta a la API
            response.results.sort(function(a, b) {//Ordeno por orden alfabetico
                    let nombreA = a.scientificName;
                    let nombreB = b.scientificName;
                    return (nombreA < nombreB) ? -1 : (nombreA > nombreB) ? 1 : 0;
                }
            )
            //Una vez ordenado el array results lo envio a mostrarDatos()
            mostrarDatos(response.results)
        })
        .catch((error) => {//Capturo los errores en caso de que existan
            console.error("Se ha producido el siguiente erro: "+error);
            throw(error);
        });

    }else if(yearDomSelect!=="Todos" && scientificNameDomSelect==="Todos"){//Discriminando los datos por año, pero con todos los Animales de ese año
        fetch("https://api.obis.org/v3/occurrence?areaid=227&redlist=true&size=1000")
        .then(response => response.json())
        .then(response => {
            bichos = [];
            response.results.forEach(element=>{
                //Compruebo que el año del animal no sea undefined
                if(element.date_year!==undefined){
                    //Una vez comprobado que el animal tiene año datado, comparo este con el que pide el usuario, si es el mismo lo agrego al array bichos
                    if(element.date_year.toString() === yearDomSelect) bichos.push(element)
                } 
            })
            bichos.sort(function(a, b) {//Ordeno por orden alfabetico
                    let nombreA = a.scientificName;
                    let nombreB = b.scientificName;
                    return (nombreA < nombreB) ? -1 : (nombreA > nombreB) ? 1 : 0;
                }
            )
            //Llamo a la funcion mostrarDatos y le paso el array bichos, ya filtrado por los criterios del usuario
            mostrarDatos(bichos)
        })
        .catch((error) => {//Capturo los errores en caso de que existan
            console.error("Se ha producido el siguiente erro: "+error);
            throw(error);
        });

    }else{//Aqui hago una peticion a la API de todos los años pero filtrando por el Nombre Cientifico del Animal, posteriormente filtro si tambien se aplican elecciones del año
        fetch(`https://api.obis.org/v3/occurrence?scientificname=${scientificNameMostrar}&areaid=227&redlist=true&size=1000`)
        .then(response => response.json())
        .then(response => {
            bichos = [];
            //Recorro el resultado de la respuesta en json de la consulta a la API (el resultado sera un array y no un objeto asi puedo trabjar con el forEach)
            response.results.forEach(element => {
                //Si el usuario no ha seleccionado año agrego todos los Animales que coinciden con ese nombre cientifico a el array bichos para mostrar posteriormente
                if(yearDomSelect === "Todos") bichos.push(element)
                //En caso de que haya elegido año, compruebo que no sea undefined, y comparo el año del Animal especifico del forEach y el del usuario y si es el mismo lo guardo en el array bichos
                else if(yearDomSelect!=="Todos" && (element.year!==undefined || element.date_year!==undefined)){
                    if(element.year===undefined){
                        if(element.date_year.toString() === yearDomSelect) bichos.push(element)
                    }else if(element.date_year===undefined){
                        if(element.year.toString() === yearDomSelect) bichos.push(element)
                    }
                    
                }  
            })
            //Llamo a la funcion mostrarDatos y le paso el array bichos, ya filtrado por los criterios del usuario
            mostrarDatos(bichos);
        })
        .catch((error) => {//Capturo los errores en caso de que existan
            console.error("Se ha producido el siguiente erro: "+error);
            throw(error);
        });
    }
    
})

/**
 * 
 * @param {Array.<Object>} bichos - Sera un array que contendra todos los objetos uno por cada Animal que devuelve en conjunto la consulta a la API segun los parametros que ha escogido el usuario
 */
function mostrarDatos(bichos){
    console.log(bichos)
    /**
     * @type {Object}
     */
    let divDatos = $("#datos");
    /**
     * @type {string}
     */
    let listaRoja;
    /**
     * @type {Object} - objeto que contendra el atributo por cada Nombre Cientifico que exista cono clave, y el nº que hay de estos como clave
     * (en la iteraccion del array bichos se pueden ir agregando nuevas propiedades que son equivalentes al scientificName y pueden incrementar el valor de estas propiedades)
     */
    let indices = {};

    //Para borrar el gif que muestro de carga al dar al boton enviar
    $(divDatos).empty();

    //Evaluo si el array contiene datos, puede que no se hayan dado coincidencias de datos con los parametros que ha especificado el usuario
    if(bichos.length===0){
        divDatos.append("<h3>No hay datos</h3>");
    }else{
        /**
         * @type {string} - la variable cadena ira almacenando el codigo html que posteriormente se agregara con jQuery
         * Primero le introduzco un div con un id='acordeon' para poder trabajar luego con este div a traves de la libreria jQueryUi 
         */
        let cadena="<div id='acordeon'>"
        //Recorro el array bichos elemento a elemento y por cada uno creo un elemento nuevo para insertar a cadena, con sus respectivas validaciones en los datos
        bichos.forEach(element=>{
            //EN CADA IF COMPRUEBO EL VALOR PARA QUE NO SEA UNDEFINED Y NO MOSTRAR EN PANTALLA VALORES QUE NO EXISTEN

            //Este if valdra para agregar sentido a la categoria de la lista roja del Animal
            if(element.category!==undefined){
                
                switch (element.category.toUpperCase()) {
                    case "CR":
                        listaRoja = "En Peligro Crítico";
                      break;
                    case "EN":
                        listaRoja = "En Peligro";
                      break;
                    case "VU":
                        listaRoja = "Vulnerable";
                      break;
                    default:
                      break;
                }

                /*
                * Con este if y el objeto indices que se crea nuevo cada vez que se hace una consulta compruebo si existe la propiedad que se llame igual al nombre del animal especifico que corresponda a
                * element.scientificName, si existe aumento el valor de este en 1, y si no existe lo creo e igualo a 1, todo esto para mostrar el indice correspondiente con el conteo total de Animales por cada Nombre Cientifico
                */
                if(indices.hasOwnProperty(`${element.scientificName}`)===false){
                    indices[`${element.scientificName}`] = 1;
                }else{
                    indices[`${element.scientificName}`]++;
                }

                //Agrego a cadena un titulo h3 y abro un div que contendra el contenido, esto siguiendo las especificaciones para poder trabajar con la funcion accordion de jQueryUi
                cadena +=`<h3>${element.scientificName} ${indices[`${element.scientificName}`]}</h3>
                <div><p><img src='${devolverUrl(element.scientificName)}' style='width:15vw; border:0'/></p>
                <p>Categoria lista roja: ${element.category} - ${listaRoja}</p>`;
            }
            //If para el nombre comun
            if(element.vernacularName!==undefined){
                cadena+=`<p>Nombre Común: ${element.vernacularName}</p>`;
            }
            //If para la especie del animal
            if(element.species!==undefined){
                cadena+=`<p>Especie: ${element.species}</p>`;
            }
            //If para el id unico del animal
            if(element.id!==undefined){
                cadena+=`<p>Id Único del Animal: ${element.id}</p>`;
            }
            //If para el año en el que fue datado por primera vez el animal
            if(element.year!==undefined || element.date_year!==undefined){
                if(element.year===undefined){
                    cadena+=`<p>Fecha: ${element.date_year}</p>`;
                }else if(element.date_year===undefined){
                    cadena+=`<p>Fecha: ${element.year}</p>`;
                }
            }
            //If para la ultima fecha que ha sido datado el animal
            if(element.modified!==undefined){
                cadena+=`<p>Ultima actualizacion de fecha: ${element.modified}</p>`;
            }
            //If para saber el medio con el que se hizo las bases del registro del animal
            if(element.basisOfRecord!==undefined){
                cadena+=`<p>Base del registro: ${element.basisOfRecord}</p>`;
            }
            //If para saber la longitud y latitud del animal
            if(element.decimalLatitude!==undefined && element.decimalLongitude!==undefined){
                cadena+=`<ul style='list-style-position: inside;'>Coordenadas:<li>Latitud: ${element.decimalLatitude}</li><li>Longitud: ${element.decimalLongitude}</li></ul>`
            }
            //Ciero el div donde esta el contenido de cada elemento  
            cadena+="</div>"; 
        })
        //Tras realizar el forEach cierro el div que contiene todos los elementos segun la consulta del usuario
        cadena+="</div>";
        divDatos.append(cadena); 
    }
    //Hago uso del metodo accordion de jQueryUi especificandole ciertas caracteristicas para agilizar y hacer mas limpio el codigo hacerlo mas presentable en la web
    $("#acordeon").accordion({
        header:"h3",
        animate:700,
        heightStyle: "content" 
    })
}

/**
 * 
 * @param {string} bicho - sera un el nombre del Animal especifico que le manden por parametro, el cual buscamos en el objeto datosImg para compararlo con todos los nombres existentes y obetener la url de la imagen de este
 * haciendo uso de clave:valor el objeto datosImg es asi: nombre:"nombreCientificoCorrespondiente", url:"urlDelAnimal"
 * 
 * @return {string} Un string que sera la url de la foto del Nombre Cientifico del bicho que especifico que pasa el forEach de mostrarDatos()
 * 
 * @example
 * 
 *      devolverUrl("Bodianus scrofa")
 * 
 */
function devolverUrl(bicho){
    let url = "";
    datosImg.scientificNameImg.forEach(element=>{
        if(bicho === element.nombre) {
            url = element.url;
        }
    })
    return url;
}