export async function register(req,res,next){
  res.status(201).json({
    message:"user registered successfully"
  })
}