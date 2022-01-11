var express = require('express');
var router = express.Router();

router.get('/:id', function(req, res, next) {
  //res.send(req.params.id);
  console.log(req.params.id+ " "+new Date())
  res.sendFile('C:/Users/Tobin/Desktop/Basic chatboard/public/index.html')
});

module.exports = router;




/** 
app.route('/room/:id')
.get(function (req, res, next) {
  console.log(req.params.id)
  rooms.roomlist.some(function (element, index){
    if(element.url === req.params.id){
      rooms.roomlist[index].connections.push(connection);
      console.log(connection);
      res.send('public')
    }
  })
})
*/
