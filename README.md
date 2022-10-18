<br />

<p align="center">
  <img
    width="25%"
    src="https://upload.wikimedia.org/wikipedia/commons/0/09/Logo_ACHS.svg"
  />
  <h1 align="center">ASOCIACIÓN CHILENA DE SEGURIDAD</h1>
  <h2 align="center">Tranformación Digital ▪ Equipo de Desarrollo</h2>
</p>

<br />

---

<br />

<h2 align="center"><b>ACHS.AdmisionDigital.Ms.Middleware</b></h2>
<h3 align="center"><b>NodeJs</b></h3>

# Introducción 
Este servicio se encarga de manejar las integraciones Middleware - SAP
Tales como creacion de admisiones, obtencion de data de SAP, Envio de documentos a SAP, etc

## ⚙️ **Variables Entorno  **
PRE-REQUISITOS:
Tener instalado:
-	Azure CLI:
•	Windows: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows?tabs=azure-cli 
•	Ubuntu: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt 
•	MAC: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-macos
-	jq (Solo usuarios MAC y/o Linux): 
•	Ubuntu:  https://lindevs.com/install-jq-on-ubuntu/
•	MAC: https://formulae.brew.sh/formula/jq 
- Tener permisos: Estar agregado a las políticas de acceso del keyvault de desarrolloy/o qa 

PASOS:
1)	Abrir la powershell modo administrador
2)	Dentro de la powershell ejecutar el comando: az login
3)	Dirigirse a la carpeta del repositorio que deseamos correr en local
•	Usuarios Windows
4)	Ejecutar el siguiente comando: & env/env.ps1 ambiente (ambiente:desa/qa)
•	Usuarios MAC y/o Linux:
4)	Ejecutar el siguiente comando: bash env/env.sh ambiente (ambiente:desa/qa)

RESULTADO: Este script ejecuta la lógica necesaria para configurar un archivo de entorno (.env) con las variables del ambiente que corresponde, este archivo .env está ignorado dado que esta configuración de entorno la hace el pipeline cuando se completa los PR a las distintas ramas principales.

## Ejecutando localmente

Asegúrate de tener [Node.js](http://nodejs.org/) vs 14

```sh
git clone https://achsdev.visualstudio.com/COD%20-%20Admision%20Digital/_git/ACHS.AdmisionDigital.Ms.Middleware 
cd ACHS.AdmisionDigital.Ms.Middleware
npm install
node index
```