import express from "express"
import fs from "fs"
import path from "path"
import cors from "cors"
import jwt from "jsonwebtoken"
import nodmailer from "./utils/nodmailer.js"
const PORT = process.env.PORT || 8080

const app = express()
app.use(express.json())
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}))

app.post("/login", (req, res) => {
    const {name, password} = req.body
    console.log(name, password);

    const allUser = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`))).find(e => e.name == name && e.password == password)
   
    if (allUser) {
        res.status(200).json({
            data : allUser,
            status: 200,
            token: jwt.sign(allUser.id, "akmal"),
        })
    } else if (!allUser) {
        res.status(401).json({
            "status": "401",
        })
    }
})

app.post("/singUp", async (req, res) => {
    const {frontId, name, email, password} = req.body
    console.log(frontId);
    if (password == frontId && frontId && password) {
        const allUser = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`)))

        const newObj = {
            id: allUser.at(-1).id + 1 || 1, 
            name,
            password,
            role: "user",
            producId: [],
            like: [],
        }
        const tekshir = allUser.filter(e => e.name == name && e.password == password)
        tekshir.length ? res.status(300).json(false) : allUser.push(newObj)
        fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/user.json`), JSON.stringify(allUser, null, 4))
        if (allUser) {
            res.status(200).json({
                data : newObj,
                status: 200,
                token: jwt.sign(newObj.id, "akmal"),
            })
        } else if (!allUser) {
        res.status(404).json({
            "status": "404",
        })
        } 
        
    }else {
            const uniqueData = `${new Date().getTime()}`
            const id = await nodmailer(email, uniqueData)
            res.status(401).json({
                status: "401",
                id
            })
    }
})

app.post("/postProduct", (req, res) => {
    const allUser = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/product.json`)))
    const { proName, narx, img } = req.body
    console.log(proName, narx, img);
    const newObj = {
        id: allUser.at(-1).id + 1 || 1,
        proName,narx,img
    }
    allUser.push(newObj)
    fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/product.json`), JSON.stringify(allUser, null, 4))
    
    res.status(201).json("zor")
})

app.put("/putPro", (req, res) => {
    const {id, proName, narx, img} = req.body
    console.log(id, proName, narx, img);
      const allProduct = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/product.json`)))
      const product = allProduct.find(e => e.id == id)
      product.proName = proName || product.proName
      product.narx = narx || product.narx
      product.img = img || product.img
      fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/product.json`), JSON.stringify(allProduct, null, 4))
      res.status(200).json("Oka zor ozgardi")
})

app.delete("/delProduct", (req, res) => {
      const {id} = req.body
      const allProduct = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/product.json`))).filter(e => e.id != id)
      fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/product.json`), JSON.stringify(allProduct, null, 4))
      res.status(200).json("Oka Zor ozgardi")
})


const observe = (req, res, next) => {
    if (req.headers.token) {
      next()
    } else {
      return res.status(401).json("Oka hatokuuuu")
    }
}

app.get("/product", (req, res) => {
    const allUser = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/product.json`)))
    const userToken = jwt.verify(req.headers.token, "akmal")
    const user = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`))).find(e => e.id == userToken)
    if (user.producId) {
        for (const i in allUser) {
            if (user.producId.includes(allUser[i].id) ) {
                allUser[i].status = true
            } else {
                allUser[i].status = false
            }
        }
    }
    res.status(200).json(allUser)
})

app.get("/karzinka", (req, res) => {
    const allUser = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/product.json`)))
    const userToken = jwt.verify(req.headers.token, "akmal")
    const user = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`))).find(e => e.id == userToken)
    const resolt = allUser.filter(e => user.producId.includes(e.id))
    res.status(200).json(resolt)
})

app.get("/like", (req, res) => {
    const allUser = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/product.json`)))
    const userToken = jwt.verify(req.headers.token, "akmal")
    const user = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`))).find(e => e.id == userToken)
    const resolt = allUser.filter(e => user.like.includes(e.id))
    res.status(200).json(resolt)
})

app.get("/OK", (req, res) => {
    res.json("Ok")
})

app.get("/rout", observe, (req, res) => {
    const userToken = jwt.verify(req.headers.token, "akmal")
    const user = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`))).find(e => e.id == userToken)
    res.status(200).json({
        data: user
    })
})

app.delete("/delUser", (req, res) => {
    const userToken = jwt.verify(req.headers.token, "akmal")
    const user = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`))).filter(e => e.id != userToken)
    fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/user.json`), JSON.stringify(user, null, 4))
    res.status(200).json({
        data: true
    })
})


app.put("/updateLike",observe ,(req, res) => {
      const userToken = jwt.verify(req.headers.token, "akmal")
      const product = req.headers.product
      const users = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`)))
      const userLike = users.find(e => e.id == userToken)
      userLike.like.push(Number(product))

      const newUsers = users.map(e => e.id == userLike.id ? userLike : e)

      fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/user.json`), JSON.stringify(newUsers, null, 4))

      res.status(201).json("Best Updape")
})

app.put("/likeUpdate",observe ,(req, res) => {
      const userToken = jwt.verify(req.headers.token, "akmal")
      const product = req.headers.product
      const users = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`)))
      const userLike = users.find(e => e.id == userToken)
      const orn = userLike.like.findIndex(e => e == Number(product))
      userLike.like.splice(orn, 1)
      const newUsers = users.map(e => e.id == userLike.id ? userLike : e)

      fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/user.json`), JSON.stringify(newUsers, null, 4))

      res.status(201).json("Best Updape")
})

app.put("/updateKarzinka",observe ,(req, res) => {
      const userToken = jwt.verify(req.headers.token, "akmal")
      const product = req.headers.product
      const users = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`)))
      const userLike = users.find(e => e.id == userToken)
      const orn = userLike.producId.findIndex(e => e == Number(product))
      userLike.producId.splice(orn, 1)
      const newUsers = users.map(e => e.id == userLike.id ? userLike : e)

      fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/user.json`), JSON.stringify(newUsers, null, 4))

      res.status(201).json("Best Updape")
})

app.put("/karzinkaUpdate",observe ,(req, res) => {
      const userToken = jwt.verify(req.headers.token, "akmal")
      const product = req.headers.product
      const users = JSON.parse(fs.readFileSync(path.normalize(`${process.cwd()}/src/module/user.json`)))
      const userLike = users.find(e => e.id == userToken)
      userLike.producId.push(Number(product))
      const newUsers = users.map(e => e.id == userLike.id ? userLike : e)

      fs.writeFileSync(path.normalize(`${process.cwd()}/src/module/user.json`), JSON.stringify(newUsers, null, 4))

      res.status(201).json("Best Updape")
})




app.all("*", (_, res) => {
    res.status(404).json("404 page not fount ichida")
})

app.listen(PORT, console.log(PORT))