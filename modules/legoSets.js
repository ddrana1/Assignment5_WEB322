require('dotenv').config();
const Sequelize = require('sequelize');
let sequelize = new Sequelize( process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
}, {
  timestamps: false, 
});
const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
}, {
  timestamps: false,
});
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

const fs = require('fs');
const path = require('path');


function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log("Database synced successfully.");
    })
    .catch((error) => {
      return Promise.reject(`Error syncing database: ${error}`);
    });
}



function getAllSets() {
  return Set.findAll({ include: [Theme] })
    .then((sets) => {
      return sets;
    })
    .catch((error) => {
      return Promise.reject(`Error fetching sets: ${error}`);
    });
}



function getSetByNum(setNum) {
  return Set.findAll({ include: [Theme], where: { set_num: setNum } })
    .then((sets) => {
      if (sets.length > 0) {
        return sets[0];
      } else {
        return Promise.reject("Unable to find requested set");
      }
    })
    .catch((error) => {
      return Promise.reject(`Error fetching set: ${error}`);
    });
}


function getSetsByTheme(theme) {
  return Set.findAll({
    include: [Theme],
    where: { '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` } },
  })
    .then((sets) => {
      if (sets.length > 0) {
        return sets;
      } else {
        return Promise.reject("Unable to find requested sets");
      }
    })
    .catch((error) => {
      return Promise.reject(`Error fetching sets by theme: ${error}`);
    });
}

function addSet(setData) {
  return Set.create(setData)
    .then(() => {
      return Promise.resolve();
    })
    .catch((err) => {
      return Promise.reject(err.errors[0].message);
    });
}

function getAllThemes() {
  return Theme.findAll()
    .then((themes) => {
      return Promise.resolve(themes);
    })
    .catch((err) => {
      return Promise.reject(err.message);
    });
}

function editSet (setNum, setData){
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num: setNum } })
      .then((result) => {
        if (result[0] === 1) {
          resolve();
        } else {
          reject(new Error('Unable to update the set. Set not found.'));
        }
      })
      .catch((err) => {
        reject(new Error(err.errors[0].message));
      });
  });
}

function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
    Set.destroy({
      where: {
        set_num: set_num
      }
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}



module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet,
  getAllThemes, editSet, deleteSet };



