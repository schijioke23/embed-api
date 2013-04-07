/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.config = function(req, res){
  res.sendfile('test/config/config' + req.params.id + '.js');
};

exports.testJs = function(req, res){
  res.sendfile('test/js/'+req.params.file);
};