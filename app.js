//jshint esversion:6
const mongoose = require("mongoose")
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const _ = require("lodash")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const url = "mongodb+srv://admin-dani:brudi16595@cluster0.rbabv.mongodb.net"
const dbName = "todolistDB"
mongoose.connect(url+"/"+dbName,{useNewUrlParser: true, useUnifiedTopology: true})

const itemsSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, "Need name please"]
  }
})

const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, "Need name please"]
  },
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)




const item1 = new Item({name:"Wecome to your todolist"})
const item2 = new Item({name:"Hit the + button to add a new item"})
const item3 = new Item({name:"<-- Hit this to delete an item"})
/*
Item.insertMany([item1, item2, item3], function(err) {
  if(err){
    console.log(err)
  }
  else{
    console.log("insert 3 items")
  }  
})
*/
const workItems = [];

app.get("/", function(req, res) {
  let items =[]
  Item.find(function (err, data) { 
    if(err){
      console.log(err)
    }
    else{
      if(data.length===0){
        const item1 = new Item({name:"Wecome to your todolist"})
        const item2 = new Item({name:"Hit the + button to add a new item"})
        const item3 = new Item({name:"<-- Hit this to delete an item"})

        Item.insertMany([item1, item2, item3], function(err) {
          if(err){
            console.log(err)
          }
          else{
            console.log("insert 3 items")
            res.redirect("/")
          }  
        })
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: data});
      }

      
    }
  })
  

});

app.post("/", function(req, res){
  const item = req.body.newItem;
  const listName = req.body.list;
  const new_Item =  new Item({name: item})
  console.log(listName)
  if (listName === "Today"){
    new_Item.save()
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, list_found){
      list_found.items.push(new Item({name : item}))
      list_found.save()
      res.redirect("/"+listName)
    })

  }

  
});



app.post("/delete", function(req, res){
  const id = req.body.removeItem;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove(id, function(error){
      if(!error){
        console.log("Remove id "+id)
        res.redirect("/")
      }
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, function(error, foundlist){
      if(!error){
        res.redirect("/" + listName)
      }
    })
  }
});


app.get("/:listName", function(req,res){
  const listName = _.capitalize(req.params.listName)

  List.findOne({name: listName}, function (err,data) {
    if (!data){
      const list = new List({
        name: listName,
        items: [item1,item2,item3]
      })
      list.save()
      res.redirect("/"+listName)
    }
    else{
      res.render("list", {listTitle: data.name, newListItems: data.items});
    }
  })


});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;

if (port == null || port == ""){
  port=3000
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
