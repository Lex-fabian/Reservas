# Guia de Desarrollo

Esta guia te ayuda a configurar el proyecto en tu computadora para empezar a desarrollar.

## Requisitos Previos

Antes de empezar, necesitas tener instalado:

- **Node.js** 
- **MySQL** 
- **Git** 

### Verificar Instalaciones

Abre una terminal y ejecuta:

```bash
node --version   # Debe mostrar v18.x.x o superior
npm --version    # Debe mostrar 9.x.x o superior
mysql --version  # Debe mostrar 5.7.x o superior
git --version    # Debe mostrar 2.x.x o superior
```

---

## Configurar el Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/ReservasApp.git
cd ReservasApp/backend
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalara todas las librerias necesarias (Express, Sequelize, JWT, etc).
