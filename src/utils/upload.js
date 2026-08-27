const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio uploads exista
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración del almacenamiento (Disk Storage)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Directorio raíz del backend/uploads/
  },
  filename(req, file, cb) {
    // Generar nombre de archivo único: campo-timestamp.extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Filtro para aceptar únicamente imágenes
function checkFileType(file, cb) {
  // Expresión regular con las extensiones permitidas
  const filetypes = /jpg|jpeg|png|webp|gif/;

  // Verificar la extensión
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // Verificar el MIME type
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten subir imágenes (jpg, jpeg, png, webp, gif)'));
  }
}

// Configuración final de Multer
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de tamaño: 5MB
  }
});

module.exports = upload;
