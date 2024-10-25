const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public")); // Ensure the 'public' folder contains your HTML file
const filePath = path.join(__dirname, "allTeams.json"); // Ruta correcta al archivo

app.use(express.static("Logo")); // Servir imágenes estáticas de la carpeta 'Logo'

app.use(express.json()); // Para procesar JSON en las solicitudes

// Ruta para obtener los equipos según la categoría
app.get("/teams", (req, res) => {
  const categoria = req.query.category || "tercera";
  console.log("Categoría solicitada:", categoria); // Log para ver la categoría solicitada
  let filePath;

  switch (categoria) {
    case "tercera":
      filePath = path.join(__dirname, "./teamData.json");
      break;
    case "cuarta":
      filePath = path.join(__dirname, "teamData 4ta.json");
      break;
    case "quinta":
      filePath = path.join(__dirname, "teamData 5ta.json");
      break;
    default:
      return res.status(400).json({ error: "Categoría no válida" });
  }

  // Leer el archivo de la categoría seleccionada
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer el archivo", err);
      return res
        .status(500)
        .json({ error: "Error al leer los datos de los equipos" });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error("Error al parsear JSON", parseError);
      res.status(500).json({ error: "Error al procesar los datos" });
    }
  });
});

app.get("/allTeams", (req, res) => {
  const filePath = path.join(__dirname, "./allTeams.json"); // Ruta del archivo JSON
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error al cargar los datos" });
    }
    res.json(JSON.parse(data)); // Enviar los datos como respuesta
  });
});

app.post("/changeResult", (req, res) => {
  const equiposActualizados = req.body; // Los datos enviados desde el frontend

  // Leer archivo allTeams.json
  const filePath = path.join(__dirname, "allTeams.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer el archivo:", err);
      return res.status(500).json({ message: "Error al leer el archivo" });
    }

    let allTeams = JSON.parse(data); // Convertir JSON en objeto

    // Actualizar equipos
    equiposActualizados.forEach((equipoActualizado) => {
      const equipo = allTeams.find(
        (e) =>
          e.nombre === equipoActualizado.nombre &&
          e.categoria === equipoActualizado.categoria
      );

      if (equipo) {
        // Actualización directa de los valores solo si no son null ni undefined
        if (equipoActualizado.golesFavor != null) {
          equipo.goles_favor =
            Number(equipoActualizado.golesFavor) + Number(equipo.goles_favor); // Sumar goles a favor
        }
        if (equipoActualizado.golesContra != null) {
          equipo.goles_contra =
            Number(equipoActualizado.golesContra) + Number(equipo.goles_contra); // Sumar goles en contra
        }
        if (equipoActualizado.puntos != null) {
          equipo.puntos =
            Number(equipoActualizado.puntos) + Number(equipo.puntos); // Sumar puntos
        }
        if (equipoActualizado.partidosJugados != null) {
          equipo.partidos_jugados =
            Number(equipoActualizado.partidosJugados) +
            Number(equipo.partidos_jugados); // Sumar partidos jugados
        }
      }
    });

    // Guardar los cambios en allTeams.json
    fs.writeFile(filePath, JSON.stringify(allTeams, null, 2), (err) => {
      if (err) {
        console.error("Error al escribir el archivo:", err);
        return res
          .status(500)
          .json({ message: "Error al escribir el archivo" });
      }

      res.json({ message: "Equipos actualizados correctamente" });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
