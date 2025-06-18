profe: {"_id": "673e5cf1b81387aacc749074",
"rol": "profesor",
"nombres": "juan",
"apellidos": "perez",
"edad": 45,
"correo": "perez@gmail.com",
"dni": 4557897,
"dniTutor": [
  null
],
"dniEstudiantes": [],
"tutores": [],
"estudiantes": [],
"password": "$2a$10$uTzZnlZsxKc.Fe9Hg6/dV.n7lleCDV/Ty5yFEFbqSQU83MGU.N932",
"__v": 0
}

materia: {
    "_id": {
      "$oid": "671196b46c5ad62b8d0b2eb0"
    },
    "nombre": "Fisica",
    "horario": null,
    "curso": {
      "$oid": "6715b92ec49813228daa2acb"
    },
    "profesor": {
      "$oid": "673e5cf1b81387aacc749074"
    }
  }
  curso:{
    "_id": "6715b92ec49813228daa2acb",
    "grado": 1,
    "nivel": "primaria",
    "division": "A",
    "turno": "maniana",
    "materias": [
      "67411c72fbf06fd3e5e7944e"
    ],
    "estudiantes": [
      "6715b92ec49813228daa2ac7"
    ],
    "__v": 2
  }




  posible codigo de consulta 
  use('EscuelaItaliana');

// Obtener los IDs de los estudiantes de los cursos asociados.
const estudiantesIds = db.getCollection('cursos')
  .find({ _id: ObjectId("6715b92ec49813228daa2acb") }) // Reemplaza con los IDs de los cursos necesarios
  .toArray()
  .flatMap(curso => curso.estudiantes);

// Buscar los datos de los estudiantes relacionados.
db.getCollection('usuarios').find({ _id: { $in: estudiantesIds } });



671066c5e94a81e075214ee8



use('EscuelaItaliana');

// Paso 1: Obtener los IDs de las materias relacionadas con el profesor.
const profesorId = ObjectId("671066c5e94a81e075214ee8"); // Reemplaza con el ID del profesor
const materias = db.getCollection('materias')
  .find({ profesor: profesorId })
  .toArray();

// Extraer los IDs de las materias.
const materiasIds = materias.map(materia => materia._id);

// Paso 2: Obtener los cursos relacionados con esas materias.
const cursos = db.getCollection('cursos')
  .find({ materias: { $in: materiasIds } })
  .toArray();

// Extraer los IDs de los estudiantes de esos cursos.
const estudiantesIds = cursos.flatMap(curso => curso.estudiantes);

// Paso 3: Buscar los datos de los estudiantes relacionados.
const estudiantes = db.getCollection('usuarios')
  .find({ _id: { $in: estudiantesIds } })
  .toArray();

// Imprimir los estudiantes relacionados.
printjson(estudiantes);



---------------------------------------
use('EscuelaItaliana');

// Paso 1: Obtener los IDs de las materias relacionadas con el profesor.
const profesorId = ObjectId("671066c5e94a81e075214ee8"); // Reemplaza con el ID del profesor
const materias = db.getCollection('materias')
  .find({ profesor: profesorId })
  .toArray();

// Extraer los IDs de las materias.
const materiasIds = materias.map(materia => materia._id);

// Crear un mapa de materiaId a materia para acceso rápido
const materiasMap = {};
materias.forEach(materia => {
  materiasMap[materia._id.toString()] = materia;
});

// Paso 2: Obtener los cursos relacionados con esas materias.
const cursos = db.getCollection('cursos')
  .find({ materias: { $in: materiasIds } })
  .toArray();

// Extraer los IDs de los estudiantes de esos cursos.
const estudiantesIds = cursos.flatMap(curso => curso.estudiantes);

// Paso 3: Buscar los datos de los estudiantes relacionados.
const estudiantes = db.getCollection('usuarios')
  .find({ _id: { $in: estudiantesIds } })
  .toArray();

// Crear un mapa de estudianteId a estudiante para acceso rápido
const estudiantesMap = {};
estudiantes.forEach(estudiante => {
  estudiantesMap[estudiante._id.toString()] = estudiante;
});

// Paso 4: Construir los objetos con los campos adicionales
const resultados = [];

cursos.forEach(curso => {
  const cursoNombre = curso.grado + " " + curso.division;
  
  curso.materias.forEach(materiaId => {
    const materia = materiasMap[materiaId.toString()];
    if (materia) { // Verificar si la materia es del profesor
      curso.estudiantes.forEach(estudianteId => {
        const estudiante = estudiantesMap[estudianteId.toString()];
        if (estudiante) {
          resultados.push({
            _id: estudiante._id,
            nombres: estudiante.nombres,
            apellidos: estudiante.apellidos,
            DNI: estudiante.dni,
            Curso: cursoNombre,
            materia: materia.nombre,
            idmateria: materia._id
          });
        }
      });
    }
  });
});

// Paso 5: Imprimir los resultados
printjson(resultados);
-----------------------------
use('EscuelaItaliana');

const profesorId = ObjectId("671066c5e94a81e075214ee8");

const pipeline = [
  // Encontrar materias asignadas al profesor
  {
    $match: { profesor: profesorId }
  },
  {
    $lookup: {
      from: "cursos",
      localField: "_id", // Relacionar el ID de materia con las materias en "cursos"
      foreignField: "materias",
      as: "cursos"
    }
  },
  {
    $unwind: "$cursos" // Descomponer el array de cursos para procesar cada uno
  },
  {
    $lookup: {
      from: "usuarios",
      localField: "cursos.estudiantes", // Relacionar con los estudiantes en el curso
      foreignField: "_id",
      as: "estudiantes"
    }
  },
  {
    $unwind: "$estudiantes" // Descomponer el array de estudiantes para procesar cada uno
  },
  {
    $lookup: {
      from: "notas",
      let: { estudianteId: "$estudiantes._id", materiaId: "$_id" }, // Variables locales para combinar con "notas"
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$estudiante", "$$estudianteId"] }, // Comparar estudiante
                { $eq: ["$materia", "$$materiaId"] },      // Comparar materia
                { $eq: ["$profesor", profesorId] }         // Asegurar que la nota fue asignada por este profesor
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            calificacion: 1,
            tipoEvaluacion: 1
          }
        }
      ],
      as: "notas"
    }
  },
  {
    $project: {
      _id: 0, // No incluir el ID principal de la colección materias
      materiaId: "$_id",
      materia: "$nombre",
      curso: {
        $concat: [
          { $toString: "$cursos.grado" }, // Convertir "grado" a string
          " ",
          "$cursos.division"
        ]
      },
      estudiante: {
        _id: "$estudiantes._id",
        nombres: "$estudiantes.nombres",
        apellidos: "$estudiantes.apellidos",
        DNI: "$estudiantes.dni"
      },
      nota: {
        $ifNull: [
          { $arrayElemAt: ["$notas", 0] }, // Si existe nota, tomar la primera
          { calificacion: "Sin nota", tipoEvaluacion: null, _id: null } // Si no existe nota, valores predeterminados
        ]
      }
    }
  }
];

// Paso 2: Ejecutar la consulta y construir los resultados
const resultados = db.materias.aggregate(pipeline).toArray();

// Paso 3: Formatear los resultados finales
const salida = resultados.map(result => ({
  ...result.estudiante,
  Curso: result.curso,
  materia: result.materia,
  idmateria: result.materiaId,
  calificacion: result.nota.calificacion,
  tipoEvaluacion: result.nota.tipoEvaluacion,
  notaid: result.nota._id
}));

// Paso 4: Imprimir los resultados finales
printjson(salida);
