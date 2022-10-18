const insertarAdmision = () => {
  return {
    hostname: process.env.URLDB,
    path: `api/admisiondigital`
  };
};

const getAdmisionByID = (id) => {
  return {
    hostname: process.env.URLDB,
    path: `api/admisiondigital/${id}`
  };
};

const insertMetaAdicional = () => {
  return {
    hostname: process.env.URLDB,
    path: `api/firmadigital/insertMetaAdicional`
  };
};

const getInfoAdmisionByID = (rut) => {
  return {
    hostname: process.env.URLDB,
    path: `api/admisiondigital/admisionbyrut/?rut=${rut}`
  };
};

const getInfoAdmisionByIDUnify = (rut) => {
  return {
    hostname: process.env.URLDB,
    path: `api/admisiondigital/admisionbyrutunify/?rut=${rut}`
  };
};

module.exports = { insertarAdmision, getAdmisionByID, insertMetaAdicional, getInfoAdmisionByID, getInfoAdmisionByIDUnify };
