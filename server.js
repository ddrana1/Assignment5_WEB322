/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: ______Divya Devendrasinh Rana______ Student ID: ___138704176______ Date: _____27/11/2023_________
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/



const express = require('express');
const legoData = require('./modules/legoSets');


const app = express();
app.set('view engine', 'ejs');
const port = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render("home");
});

app.get('/about', (req, res) => {
  res.render("about");
});

legoData.initialize()
  .then(() => {
    app.get('/', (req, res) => {
      res.send('Assignment 5:  Divya Rana - 138704176');
    });

    app.get('/lego/sets', (req, res) => {
      const theme = req.query.theme;
      if (theme) {
        legoData.getSetsByTheme(theme)
        .then((sets) => res.render("sets", { sets }))
        .catch((error) => res.status(404).render("404",  {message: "I'm sorry, we're unable to find the requested sets"}));
      }
      else
      {
        legoData.getAllSets()
        .then((sets) => res.render("sets", { sets }))
        .catch((error) => res.status(404).render("404",  {message: "I'm sorry, we're unable to find the requested sets"}));
      }
        
    });

    app.get('/lego/sets/:set_num', (req, res) => {
      const setNum = req.params.set_num;
      legoData.getSetByNum(setNum)
        .then((set) => {
          if (set) {
            res.render("set", { set });
          } else {
            res.status(404).render("404",  {message: "I'm sorry, we're unable to find the requested sets"});
          }
        })
        .catch((error) => {
          console.error('Error getting LEGO set:', error);
          res.status(500).render("404",  {message: "I'm sorry, we're unable to find the requested sets"});
        });
    });

    app.get('/lego/sets/id-demo', (req, res) => {
      const set_num = req.params.set_num;
        legoData.getSetByNum(set_num)
        .then((sets) => res.render("sets", { sets }))
        .catch((error) => res.status(404).render("404",  {message: "I'm sorry, we're unable to find what you're looking for"}));
    });
    
    app.get('/lego/addSet', (req, res) => {
        legoData.getAllThemes()
          .then((themes) => {
            res.render('addSet', { themes: themes });
          })
          .catch((error) => {
            res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
          });
      });
    app.post('/lego/addSet', (req, res) => {
        legoData.addSet(req.body)
          .then(() => {
            res.redirect('/lego/sets');
          })
          .catch((error) => {
            res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
          });
    });
    app.get('/lego/editSet/:num', (req, res) => {
      const setNum = req.params.num;   
      Promise.all([
        legoData.getSetByNum(setNum),
        legoData.getAllThemes()
      ])
        .then(([set, themeData]) => {
          if (set && themeData) {
            res.render("editSet", { themes: themeData, set: set });
          } else {
            res.status(404).render("404", { message: "I'm sorry, we're unable to find the requested set or themes" });
          }
        })
        .catch((err) => {
          res.status(404).render("404", { message: err });
        });
    });
    
    app.post('/lego/editSet', (req, res) => {
      const setNum = req.body.set_num;
      const setData = req.body;   
      legoData.editSet(setNum, setData)
        .then(() => {
          res.redirect('/lego/sets');
        })
        .catch((err) => {
          res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
        });
    });

    app.get('/lego/deleteSet/:num', (req, res) => {
      const setNum = req.params.num;  
      legoData.deleteSet(setNum)
        .then(() => {
          res.redirect('/lego/sets');
        })
        .catch((error) => {
          res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
        });
    });
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error initializing LEGO sets:', error);
  



});
