let $ = $ || function(){
    return {
        html: function(){
            return;
        },
        on: function(){
            return;
        }
    }
};

let toLowerSerpent = function(input: String){
    return input.toLowerCase().split(" ").join("-");
}

let generateUniqueHashId = function(){
    return Math.random().toString(16).replace(".", "") + new Date().getTime().toString(16);
}

// Base Classes
class BaseNode {
    name: string;
    id: string;
    visible: string;
    
}

// Hierarchy Classes
class HierarchyController {
    hierarchyModel: HierarchyModel
    hierarchyView: HierarchyView
    constructor(hierarchyModel: HierarchyModel, hierarchyView: HierarchyView) {
        this.hierarchyModel = hierarchyModel;
        this.hierarchyView = hierarchyView;
        this.display();
    }
    display(){
        this.hierarchyView.display(this.hierarchyModel);
        this.hierarchyView.initLogic(this);
    }
    collapseNode(nodeId:String){
        this.hierarchyModel.collapseNode(nodeId);
        this.display();
    }
    edit(nodeId:String){
        this.hierarchyView.edit(nodeId, this);
    }
    updateNodeName(nodeId:String, newNodeName:String){
        this.hierarchyModel.updateNodeName(nodeId, newNodeName);
        this.display();
    }
    add(nodeId:String){
        this.hierarchyModel.add(new HierarchyNode("New Node", []), nodeId:String);
        this.display();
    }
    remove(nodeId:String){
        this.hierarchyModel.remove(nodeId:String);
        this.display();
    }
}

class HierarchyView {
    hierarchyController: HierarchyController
    hierarchyWindow: Object
    constructor(hierarchyWindow: Object){
        this.hierarchyWindow = hierarchyWindow;
    }
    displayHierarchyModelHTML(hierarchyModel:HierarchyModel){
        let result = "";
        let previousIndentAmount = 0;
        let hierarchyModel = hierarchyModel.getHierarchyModelAsObject();
        hierarchyModel.iterate(
            hierarchyModel.hierarchyRoot, 
            (node: HierarchyNode, indentAmount: Number) => {
                if (indentAmount > previousIndentAmount){
                    // for (let i = 0; i < indentAmount - previousIndentAmount; i++){ 
                        result += "<ul>";
                    // }
                } else 
                if (indentAmount < previousIndentAmount){
                    for (let i = 0; i < previousIndentAmount - indentAmount; i++){ // UL tags must match indentation levels
                        result += "</ul>";
                    }
                }
                previousIndentAmount = indentAmount;
                result += this.displayNodeHTML(node);
            },
            previousIndentAmount
        );
        for (let i = 0; i < previousIndentAmount; i++){
            result += "</ul>";
        }
        return "<ul>" + result + "</ul>";
    }
    displayNodeHTML(node: HierarchyNode){
        if (node.visible){
            return this.generateNodeListElement(node.id, node.name);
        } else {
            return "";
        }
    }
    generateNodeStyle(){
        return "style='width: 200px;'";
    }
    generateNodeListElement(nodeId:String, nodeName:String){
        return ""                                                                                       +
            "<li "+this.generateNodeStyle()+">"                                                         +
                "<div class='node' id='"+nodeId+"'>"                                                    +
                    "<span class='node-name' "+this.generateNodeNameStyle()+">"                         +
                        nodeName                                                                        +
                    "</span>"                                                                           +
                    this.generateNodeButtons()                                                          +
                "</div>"                                                                                +
                
            "</li>"
    }
    generateNodeNameStyle(){
        return "style='font-weight: bold;'";
    }
    generateNodeButtons(){
        return "" +
                "<div class='node-buttons'>"                                                            +
                    "<span class='collapse'> collapse </span>|"                                         + 
                    "<span class='edit'> edit </span>|"                                                 + 
                    "<span class='add'> add </span>|"                                                   + 
                    "<span class='remove'> remove </span>"                                              +
                "</div>";
    }
    display(hierarchyModel: HierarchyModel){
        this.hierarchyWindow.html(this.displayHierarchyModelHTML(hierarchyModel));
    }
    initLogic(hierarchyController: HierarchyController){
        $(".collapse").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.collapseNode(nodeId);
        })
        $(".edit").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.edit(nodeId);
        })
        $(".add").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.add(nodeId);
        })
        $(".remove").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".node")[0].id;
            hierarchyController.remove(nodeId);
        })
    }
    edit(nodeId: String, hierarchyController: HierarchyController){
        let node = $("#"+nodeId);
        let nodeName = node.find(".node-name").text();
        let html = ""                                   +
            "<input placeholder='" + nodeName + "'>" +
            "<button class='save'>Save</button>"        + 
            "<button class='cancel'>Cancel</button>";
        node.html(html);
        node.find(".cancel").on("click", ()=>{
            hierarchyController.display();
        });
        node.find(".save").on("click", ()=>{
            let newNodeName = node.find("input").val();
            hierarchyController.updateNodeName(nodeId, newNodeName);
            hierarchyController.display();
        });
    }
}

class HierarchyModel {
    hierarchyRoot: HierarchyNode
    constructor(hierarchy: Object){
        if (hierarchy.hasOwnProperty("name")){
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        } else {
            return;
        }
    }
    getHierarchyModelAsObject(){
        return this;
    }
    buildHierarchyFromObject(hierarchy: Object, currentNode: HierarchyNode){
        let childNode = null;
        if (hierarchy.hasOwnProperty("name")){
            currentNode.name = hierarchy.name;
        } else {
            return null;
        }
        if (hierarchy.hasOwnProperty("children")){
            for (let child in hierarchy.children){
                childNode = this.buildHierarchyFromObject(
                    hierarchy.children[child], 
                    new HierarchyNode("",[])
                )
                if (childNode){
                    currentNode.children.push(childNode);
                }
            }
        }
        if (hierarchy.hasOwnProperty("visible")){
            currentNode.visible = hierarchy.visible;
        }
        if (hierarchy.hasOwnProperty("collapsed")){
            currentNode.collapsed = hierarchy.collapsed;
        }
        return currentNode;
    }
    iterate(currentNode: HierarchyNode, callback: Function, indentAmount: Number){
        if (currentNode){
            callback(currentNode, indentAmount);
            indentAmount++;
            for (let childNode of currentNode.children){
                this.iterate(childNode, callback, indentAmount);
            }    
        } else {
            return
        }
    }
    toggleNode(node: HierarchyNode){
        for (let childNode of node.children){
            childNode.visible = !childNode.visible;
            this.toggleNode(childNode);
        }
    }
    hideChildren(parent: HierarchyNode){
        for (let childNode of parent.children){
            childNode.visible = false;
            this.hideChildren(childNode);
        }
    }
    showChildren(parent: HierarchyNode){
        for (let childNode of parent.children){
            if (!parent.collapsed && parent.visible) {
                childNode.visible = true;
            }
            this.showChildren(childNode);
        }
    }
    findNode(currentNode: HierarchyNode, nodeId: String){
        if (currentNode.id === nodeId) {
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.findNode(childNode, nodeId);
                if (resultNode && resultNode.id === nodeId){
                    return resultNode;
                }
            }
            return resultNode;
        }
    }
    removeNode(currentNode: HierarchyNode, nodeId: String){
        if (currentNode.id === nodeId) {
            let resultNodeIndex = currentNode.children.indexOf(resultNode);
            currentNode.children.splice(resultNodeIndex, resultNodeIndex+1);
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.removeNode(childNode, nodeId);
                if (resultNode && resultNode.id === nodeId){
                    let resultNodeIndex = currentNode.children.indexOf(resultNode);
                    currentNode.children.splice(resultNodeIndex, resultNodeIndex+1);
                }
            }
            return resultNode;
        }
    }
    add(newNode:HierarchyNode, nodeId:String){
        let node = this.findNode(this.hierarchyRoot, nodeId);
        node.children.unshift(newNode);
    }
    remove(nodeId:String){
        let node = this.removeNode(this.hierarchyRoot, nodeId);
    }
    collapseNode(nodeId: String){
        let nodeToCollapse = this.findNode(this.hierarchyRoot, nodeId);
        nodeToCollapse.collapsed = !nodeToCollapse.collapsed;
        if (nodeToCollapse.collapsed){
            this.hideChildren(nodeToCollapse);
        } else {
            this.showChildren(nodeToCollapse);
        }
    }
    updateNodeName(nodeId:String, newNodeName:String){
        let node = this.findNode(this.hierarchyRoot, nodeId);
        node.name = newNodeName;
    }
}

class HierarchyNode extends BaseNode {
    collapsed: Boolean
    children: Array<BaseNode>;
    constructor(name: string, children: Array<HierarchyNode>){
        this.name = name;
        this.id = generateUniqueHashId();
        this.children = children;
        this.visible = true;
        this.collapsed = false;
    }
}

// Notes Classes
class NoteNode extends BaseNode {
    constructor(name: string){
        this.name = name;
        this.id = generateUniqueHashId();
        this.visible = true;
        this.content = "";
    }
}

class NoteMenuModel {
    notes: Array<BaseNode>;
    constructor(noteList:Array<BaseNode>){
        this.notes = this.convertJsonArrayToNoteArray(noteList);
    }
    convertJsonArrayToNoteArray(noteList:Array<BaseNode>){
        let notes = [];
        let noteNode;
        for (let note of noteList){
            if (note.hasOwnProperty("name")){
                noteNode = new NoteNode(note.name);
                if (note.hasOwnProperty("content")){
                    noteNode.content = note.content;
                }
                notes.unshift(noteNode);
            }
        }
        return notes;
    }
    add(note:NoteNode){
        this.notes.unshift(note);
    }
    remove(noteId:string){
        let node = this.findNode(noteId);
        if (node){
            let index = this.notes.indexOf(node);
            this.notes.splice(index, index+1);
        }
    }
    findNode(noteId:string){
        for (let note of this.notes){
            if (note.id === noteId){
                return note;
            }
        }
        return null;
    }
}

class NoteMenuController {
    noteMenuModel: NoteMenuModel
    noteMenuView: NoteMenuView
    constructor(noteMenuModel: NoteMenuModel, noteMenuView: NoteMenuView) {
        this.noteMenuModel = noteMenuModel;
        this.noteMenuView = noteMenuView;
        this.display();
    }
    display(){
        this.noteMenuView.display(this.noteMenuModel);
        this.noteMenuView.initLogic(this);
    }
    edit(nodeId:String){
        this.noteMenuView.edit(nodeId, this);
    }
    updateNodeName(nodeId:String, newNodeName:String){
        this.noteMenuModel.updateNodeName(nodeId, newNodeName);
        this.display();
    }
    add(nodeId:String){
        this.noteMenuModel.add(new NoteNode("New Note", []));
        this.display();
    }
    remove(nodeId:String){
        this.noteMenuModel.remove(nodeId:String);
        this.display();
    }
    displayNote(nodeId:String){
        this.noteMenuView.displayNote(nodeId, this);
    }
}

class NoteMenuView {
    noteMenuController: noteMenuController
    noteMenuWindow: Object
    constructor(noteMenuWindow: Object){
        this.noteMenuWindow = noteMenuWindow;
    }
    displayNoteMenuModelHTML(noteMenuModel:NoteMenuModel){
        let result = "";
        let notes = noteMenuModel.notes;
        for (let note of notes){
            result += this.displayNoteHTML(note);
        }
        return "<ul>" + result + "</ul>";
    }
    displayNoteHTML(node: NoteNode){
        return this.generateNodeListElement(node.id, node.name);
    }
    generateNodeStyle(){
        return "style='width: 200px;'";
    }
    generateNodeListElement(nodeId:String, nodeName:String){
        return ""                                                                                       +
            "<li "+this.generateNodeStyle()+">"                                                                                      +
                "<div class='note' id='"+nodeId+"'>"                                                    +
                    "<span class='note-name' "+this.generateNodeNameStyle()+">"                             +
                        nodeName                                                                        +
                    "</span>"                                                                           +
                    this.generateNodeButtons()                                                          +
                "</div>"                                                                                +
                
            "</li>"
    }
    generateNodeNameStyle(){
        return "style='font-weight: bold;'";
    }
    generateNodeButtons(){
        return "" +
                "<div class='node-buttons'>"                                                            +
                    "<span class='collapse'> collapse </span>|"                                         + 
                    "<span class='edit'> edit </span>|"                                                 + 
                    "<span class='add'> add </span>|"                                                   + 
                    "<span class='remove'> remove </span>"                                              +
                "</div>";
    }
    display(noteMenuModel: NoteMenuModel){
        this.noteMenuWindow.html(this.displayNoteMenuModelHTML(noteMenuModel));
    }
    initLogic(noteMenuController: NoteMenuController){
        $(".note-name").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            console.log(nodeId);
            noteMenuController.displayNote(nodeId);
        })
        $(".collapse").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.collapseNode(nodeId);
        })
        $(".edit").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.edit(nodeId);
        })
        $(".add").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.add(nodeId);
        })
        $(".remove").on("click", (e)=>{
            let nodeId = $(e.currentTarget).parents(".note")[0].id;
            noteMenuController.remove(nodeId);
        })
    }
    edit(nodeId: String, noteMenuController: NoteMenuController){
        let node = $("#"+nodeId);
        let nodeName = node.find(".node-name").text();
        let html = ""                                   +
            "<input placeholder='" + nodeName + "'>" +
            "<button class='save'>Save</button>"        + 
            "<button class='cancel'>Cancel</button>";
        node.html(html);
        node.find(".cancel").on("click", ()=>{
            noteMenuController.display();
        });
        node.find(".save").on("click", ()=>{
            let newNodeName = node.find("input").val();
            noteMenuController.updateNodeName(nodeId, newNodeName);
            noteMenuController.display();
        });
    }
    displayNote(noteId:String, noteMenuController: NoteMenuController){
        let node = noteMenuController.noteMenuModel.findNode(noteId);
        console.log(node);
        if (node) {
            let notesArea = $("#notes-area");
            notesArea.html(
                "<div class='note-view'>"                   +
                    "<div class='note-content'></div>"      +
                    this.displayNoteContentButtons()        +
                "</div>"
            );
            $(".note-content").html(node.content);
        }
        $("#edit-note").on("click", ()=>{
            this.displayEditor(node, noteMenuController);
        });
        $("#return-note").on("click", ()=>{
            noteMenuController.display();
        });
    }
    displayNoteContentButtons(){
        return "" +
            "<button id='edit-note'>Edit</button>" +
            "<button id='return-note'>Return</button>"
    }
    displayEditor(node:NoteNode, noteMenuController:NoteMenuController){
        if (node) {
            let notesArea = $("#notes-area");
            notesArea.html(
                "<div class='note-view'>"                           +
                    "<textarea class='note-editor'></textarea>"     +
                    this.displayNoteEditorButtons()                 +
                "</div>"
            );
            $(".note-editor").text(node.content);
        }
        $("#save-note").on("click", ()=>{
            let newContent = $("#note-editor").text();
            node.content = newContent; // TODO: Make Controller do This
            this.displayNote(node.id, noteMenuController); // TODO: Make Controller do This
        });
        $("#cancel-note").on("click", ()=>{
            noteMenuController.display();
        });
    }
    displayNoteEditorButtons(){
        return "" + 
            "<button id='save-note'>Save</button>" +
            "<button id='cancel-note'>Cancel</button>"
    }
}

let hierarchyModel = new HierarchyModel(
    {
        name: "ROOT",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    }
)
let hierarchyView = new HierarchyView($("#hierarchy-area"));
let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);
let noteMenuModel = new NoteMenuModel(
    [
        {
            name: "Note001",
            id: generateUniqueHashId(),
            content: "Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor... Lorem Ipsum Dolor..."
        }  
    ]
);
let noteMenuView = new NoteMenuView($("#notes-area"));
let noteMenuController = new NoteMenuController(noteMenuModel, noteMenuView);

// Node Unit Tests
exports.NOTE_MENU_JsonToListTest = function(test) {
    let noteMenuModel = new NoteMenuModel([{
       name: "note001",
       id: generateUniqueHashId(),
       visible: true,
       articleId: null,
       labelIds: []
    }]);
    let noteNode = new NoteNode("note001", []);
    test.notEqual(noteMenuModel.notes[0].id, noteNode.id);
    noteMenuModel.notes[0].id="";
    noteNode.id="";
    test.deepEqual(noteMenuModel.notes[0], noteNode);
    test.done();
};

exports.NOTE_MENU_MODEL_AddTest = function(test) {
    let noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    let newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    test.deepEqual(newNode, noteMenuModel.notes[0]);
    test.done();
}

exports.NOTE_MENU_MODEL_RemoveTest = function(test) {
    console.log("hello world");
    let noteMenuModel = new NoteMenuModel({
        name: "note001",
        id: generateUniqueHashId(),
        visible: true,
        articleId: null,
        labelIds: []
    });
    
    let newNode = new NoteNode("node002");
    noteMenuModel.add(newNode);
    noteMenuModel.remove(newNode.id);
    
    test.ok(0===noteMenuModel.notes.length);
    test.done();
}

exports.HIERARCHY_MODEL_JsonToTreeTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let hierarchyNode = new HierarchyNode("node001", []);
    test.notEqual(hierarchyModel.hierarchyRoot.id, hierarchyNode.id);
    hierarchyModel.hierarchyRoot.id = "";
    hierarchyNode.id = "";
    test.deepEqual(hierarchyModel.hierarchyRoot, hierarchyNode);
    test.done();
};

exports.HIERARCHY_MODEL_AddTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    test.deepEqual(newNode, hierarchyModel.hierarchyRoot.children[0]);
    test.done();
}

exports.HIERARCHY_MODEL_RemoveTest = function(test) {
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    let newNode = new HierarchyNode("node002", []);
    hierarchyModel.add(newNode, hierarchyModel.hierarchyRoot.id);
    hierarchyModel.remove(newNode.id); // TODO: Change Node Name to Unique ID!
    test.deepEqual(0, hierarchyModel.hierarchyRoot.children.length);
    test.done();
}

exports.HIERARCHY_MODEL_UpdateNode = function(test){
    let id = generateUniqueHashId();
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: id,
        collapsed: false,
        visible: true,
        children: []
    });
    hierarchyModel.updateNodeName(hierarchyModel.hierarchyRoot.id, "Test");
    
    test.done();
}

exports.HIERARCHY_VIEW_JsonToDOMTreeTest = function(test) {
    var nodeId001 = "";
    var nodeId002 = "";
    var nodeId003 = "";
    var nodeId004 = "";
    let hierarchyModel = new HierarchyModel({
        name: "node001",
        id: generateUniqueHashId(),
        collapsed: false,
        visible: true,
        children: []
    });
    nodeId001 = hierarchyModel.hierarchyRoot.id;
    let html = "";
    let hierarchyView = new HierarchyView($());
    html = "" + 
            "<ul>"                                                          +
                hierarchyView.generateNodeListElement(nodeId001, "node001") +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node002 = new HierarchyNode("node002", []);
    nodeId002 = node002.id;
    hierarchyModel.add(node002, nodeId001);
    html = "<ul>"                                                                       +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                           +
                "<ul>"                                                                  +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                       +
                "</ul>"                                                                 +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node003 = new HierarchyNode("node003", []);
    nodeId003 = node003.id;
    hierarchyModel.add(node003, nodeId002);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(nodeId003, "node003")                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    let node004 = new HierarchyNode("node004", []);
    nodeId004 = node004.id;
    hierarchyModel.add(node004, nodeId001);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(nodeId004, "node004")                           +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(nodeId003, "node003")                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    hierarchyModel.remove(nodeId004);
    html = "<ul>"                                                                           +
                hierarchyView.generateNodeListElement(nodeId001, "node001")                               +     
                "<ul>"                                                                      +
                    hierarchyView.generateNodeListElement(nodeId002, "node002")                           +  
                    "<ul>"                                                                  +
                        hierarchyView.generateNodeListElement(nodeId003, "node003")                       +  
                    "</ul>"                                                                 +
                "</ul>"                                                                     +
            "</ul>";
    test.equals(html, hierarchyView.displayHierarchyModelHTML(hierarchyModel));
    test.done();
};

exports.HIERARCHY_AUX_ToLowerSerpentTest = function(test) {
    let input;
    let result;
    input = "Test Test Test";
    result = toLowerSerpent(input);
    input = "ChChEcK-Test";
    result = toLowerSerpent(input);
    test.equals("chcheck-test", result);
    input = "c  c  c";
    result = toLowerSerpent(input);
    test.equals("c--c--c", result); // Should It Be Like This?
    test.done();
};