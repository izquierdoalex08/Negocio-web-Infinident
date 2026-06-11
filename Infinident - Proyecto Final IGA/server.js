const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARES
app.use(cors());                        // Permite peticiones desde HTML
app.use(express.json());                // Parsea el body JSON automáticamente
app.use(express.static(__dirname));           // Sirve los archivos HTML desde la misma carpeta

// ── Conexión con MongoDB Atlas ───────────────────────
const MONGO_URI = 'mongodb+srv://izquierdo_alexander:thisisatruestoryatly8769@izquierdoalex.eorne2y.mongodb.net/infinident?appName=izquierdoalex';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas correctamente'))
  .catch(err => console.error('❌ Error de conexión:', err.message));


// ── Odontólogos ────────────────────────────────────
const odontologoSchema = new mongoose.Schema({
  nombre:       String,
  cedula:       String,
  especialidad: String,
  consultorio:  String,
  telefono:     String,
  direccion:    String,
  rfc:          String
}, { timestamps: true });
const Odontologo = mongoose.model('Odontologo', odontologoSchema);

// ── Pacientes ──────────────────────────────────────
const pacienteSchema = new mongoose.Schema({
  nombre:             String,
  fechaNac:           String,
  genero:             String,
  tipoSangre:         String,
  alergias:           String,
  telefono:           String,
  correo:             String,
  curp:               String,
  direccion:          String,
  contactoEmergencia: String
}, { timestamps: true });
const Paciente = mongoose.model('Paciente', pacienteSchema);

// ── Citas ──────────────────────────────────────────
const citaSchema = new mongoose.Schema({
  paciente:   String,
  odontologo: String,
  fecha:      String,
  hora:       String,
  estado:     String,
  motivo:     String
}, { timestamps: true });
const Cita = mongoose.model('Cita', citaSchema);

// ── Recetas ────────────────────────────────────────
const recetaSchema = new mongoose.Schema({
  paciente:      String,
  medicamentos:  String,
  instrucciones: String,
  materiales:    String
}, { timestamps: true });
const Receta = mongoose.model('Receta', recetaSchema);

// ── Historial  ──────────────────────────────
const historialSchema = new mongoose.Schema({
  paciente:     String,
  dientes:      String,
  superficie:   String,
  hallazgos:    String,
  procedimiento:String,
  radiografia:  String
}, { timestamps: true });
const Historial = mongoose.model('Historial', historialSchema, 'historiales');

// ── Pagos ──────────────────────────────────────────
const pagoSchema = new mongoose.Schema({
  paciente:  String,
  fecha:     String,
  total:     Number,
  abonado:   Number,
  saldo:     Number,
  metodo:    String,
  documento: String
}, { timestamps: true });
const Pago = mongoose.model('Pago', pagoSchema);

// ── Inventario ─────────────────────────────────────
const inventarioSchema = new mongoose.Schema({
  producto:  String,
  categoria: String,
  stock:     Number,
  minimo:    Number,
  unidad:    String,
  precio:    Number,
  proveedor: String
}, { timestamps: true });
const Inventario = mongoose.model('Inventario', inventarioSchema);

//  FUNCIÓN HELPER: genera las 4 rutas CRUD para cualquier modelo con una sola llamada
function crearRutas(router, modelo, nombre) {

  // GET – obtener todos
  router.get('/', async (req, res) => {
    try {
      const docs = await modelo.find().sort({ createdAt: -1 });
      res.json(docs);
    } catch (e) {
      res.status(500).json({ error: `Error al obtener ${nombre}: ${e.message}` });
    }
  });

  // POST – crear nuevo
  router.post('/', async (req, res) => {
    try {
      const doc = new modelo(req.body);
      await doc.save();
      res.status(201).json({ mensaje: `✅ ${nombre} guardado correctamente en MongoDB`, doc });
    } catch (e) {
      res.status(500).json({ error: `Error al guardar ${nombre}: ${e.message}` });
    }
  });

  // PUT – actualizar por ID
  router.put('/:id', async (req, res) => {
    try {
      const doc = await modelo.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!doc) return res.status(404).json({ error: `${nombre} no encontrado` });
      res.json({ mensaje: `✅ ${nombre} actualizado correctamente`, doc });
    } catch (e) {
      res.status(500).json({ error: `Error al actualizar ${nombre}: ${e.message}` });
    }
  });

  // DELETE – eliminar por ID
  router.delete('/:id', async (req, res) => {
    try {
      const doc = await modelo.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ error: `${nombre} no encontrado` });
      res.json({ mensaje: `✅ ${nombre} eliminado correctamente` });
    } catch (e) {
      res.status(500).json({ error: `Error al eliminar ${nombre}: ${e.message}` });
    }
  });
}


//  Registro de rutas
const routerOdontologos = express.Router();
const routerPacientes   = express.Router();
const routerCitas       = express.Router();
const routerRecetas     = express.Router();
const routerHistorial   = express.Router();
const routerPagos       = express.Router();
const routerInventario  = express.Router();

crearRutas(routerOdontologos, Odontologo,  'Odontólogo');
crearRutas(routerPacientes,   Paciente,    'Paciente');
crearRutas(routerCitas,       Cita,        'Cita');
crearRutas(routerRecetas,     Receta,      'Receta');
crearRutas(routerHistorial,   Historial,   'Historial');
crearRutas(routerPagos,       Pago,        'Pago');
crearRutas(routerInventario,  Inventario,  'Inventario');

app.use('/api/odontologos', routerOdontologos);
app.use('/api/pacientes',   routerPacientes);
app.use('/api/citas',       routerCitas);
app.use('/api/recetas',     routerRecetas);
app.use('/api/historial',   routerHistorial);
app.use('/api/pagos',       routerPagos);
app.use('/api/inventario',  routerInventario);

// Ruta raíz → sirve el index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
// ── Iniciar servidor ───────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Rutas disponibles:`);
  console.log(`   GET/POST  → /api/odontologos`);
  console.log(`   GET/POST  → /api/pacientes`);
  console.log(`   GET/POST  → /api/citas`);
  console.log(`   GET/POST  → /api/recetas`);
  console.log(`   GET/POST  → /api/historial`);
  console.log(`   GET/POST  → /api/pagos`);
  console.log(`   GET/POST  → /api/inventario`);
  console.log(`   PUT/DELETE → /api/<coleccion>/:id`);
});