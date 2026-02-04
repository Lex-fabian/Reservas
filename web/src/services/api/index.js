// Punto de entrada centralizado para todos los servicios
import api from './config';
import { storageService } from './storage';
import { authService } from './auth.service';
import { usuarioService } from './usuario.service';
import { conjuntoService } from './conjunto.service';
import { areaService } from './area.service';
import { reservaService } from './reserva.service';
import { configuracionService } from './configuracion.service';
import { auditoriaService } from './auditoria.service';

export {
  api,
  storageService,
  authService,
  usuarioService,
  conjuntoService,
  areaService,
  reservaService,
  configuracionService,
  auditoriaService,
};

export default api;
