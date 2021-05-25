module.exports = function (req,res,next){
    const { name } = req.query; //接受参数name  
    let result = `${name}，请回应我～`; //返回result
    res.json({ msg: result }); //json格式返回result
}