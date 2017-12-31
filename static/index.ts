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
    collapseNode(nodeName:String){
        this.hierarchyModel.collapseNode(nodeName);
        this.display();
    }
    edit(nodeName:String){
        this.hierarchyView.edit(nodeName, this);
    }
    updateNodeName(nodeName:String, newNodeName:String){
        this.hierarchyModel.updateNodeName(nodeName, newNodeName);
        this.display();
    }
}

class HierarchyModel {
    hierarchyTree: HierarchyTree
    constructor(hierarchyTree: HierarchyTree){
        this.hierarchyTree = hierarchyTree;
    }
    getHierarchyTreeAsObject(){
        return this.hierarchyTree;
    }
    setHierarchyTree(hierarchyTree: HierarchyTree){
        this.hierarchyTree = hierarchyTree;
    }
    toggleNode(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        hierarchyTree.toggleNode(nodeName);
    }
    showChildren(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = this.findNode(nodeName);
        hierarchyTree.showChildren(node);
    }
    hideChildren(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = this.findNode(nodeName);
        hierarchyTree.hideChildren(node);
    }
    findNode(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        return node;
    }
    collapseNode(nodeName:String){
        let hierarchyTree = this.hierarchyTree;
        hierarchyTree.collapseNode(nodeName);  
    }
    updateNodeName(nodeName:String, newNodeName:String){
        let hierarchyTree = this.hierarchyTree;
        let node = hierarchyTree.findNode(hierarchyTree.hierarchyRoot, nodeName);
        node.name = newNodeName;
    }
}

class HierarchyView {
    hierarchyController: HierarchyController
    hierarchyWindow: Object
    constructor(hierarchyWindow: Object){
        this.hierarchyWindow = hierarchyWindow;
    }
    
    displayHierarchyTreeHTML(hierarchyModel:HierarchyModel){
        let result = "";
        let previousIndentAmount = 0;
        let hierarchyTree = hierarchyModel.getHierarchyTreeAsObject();
        hierarchyTree.iterate(
            hierarchyTree.hierarchyRoot, 
            (node: HierarchyNode, indentAmount: Number) => {
                if (indentAmount > previousIndentAmount){
                    result += "<ul>";
                } else 
                if (indentAmount < previousIndentAmount){
                    result += "</ul>";
                }
                previousIndentAmount = indentAmount;
                result += this.displayNodeHTML(node);
            },
            previousIndentAmount
        );
        return "<ul>" + result + "</ul>";
    }
    
    displayNodeHTML(node: HierarchyNode){
        if (node.visible){
            return "<li><div class='node' id='"+node.name+"' style='width: 100%; height: 50px; border: 1px dashed black;'>" + node.name + "<span class='collapse'> collapse </span>|<span class='edit'> edit </span></div></li>";    
        } else {
            return "";
        }
    }
    
    display(hierarchyModel: HierarchyModel){
        this.hierarchyWindow.html(this.displayHierarchyTreeHTML(hierarchyModel));
    }
    
    initLogic(hierarchyController: HierarchyController){
        $(".node .collapse").on("click", (e)=>{
            let nodeName = $(e.currentTarget).parent(".node")[0].id;
            hierarchyController.collapseNode(nodeName);
        })
        $(".node .edit").on("click", (e)=>{
            let nodeName = $(e.currentTarget).parent(".node")[0].id;
            hierarchyController.edit(nodeName);
        })
    }
    
    edit(nodeName: String, hierarchyController: HierarchyController){
        let node = $(".node#" + nodeName);
        $(".node#" + nodeName).html("<input placeholder='" + nodeName + "'><button class='save'>Save</button><button class='cancel'>Cancel</button>");
        node.find(".cancel").on("click", ()=>{
            hierarchyController.display();
        });
        node.find(".save").on("click", ()=>{
            let newNodeName = node.find("input").val();
            hierarchyController.updateNodeName(nodeName, newNodeName);
            hierarchyController.display();
        });
    }
}

class HierarchyTree {
    hierarchyRoot: HierarchyNode
    constructor(hierarchy: Object){
        if (hierarchy.hasOwnProperty("name")){
            this.hierarchyRoot = this.buildHierarchyFromObject(hierarchy, new HierarchyNode(hierarchy.name, []));
        } else {
            return;
        }
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
            if (!parent.collapsed) {
                childNode.visible = true;
            }
            this.showChildren(childNode);
        }
    }
    
    findNode(currentNode: HierarchyNode, nodeName: String){
        if (currentNode.name === nodeName) {
            return currentNode;
        } else {
            let resultNode = null;
            for (let childNode of currentNode.children){
                resultNode = this.findNode(childNode, nodeName);
                if (resultNode && resultNode.name === nodeName){
                    return resultNode;
                }
            }
            return resultNode;
        }
    }
    
    collapseNode(nodeName: String){
        let nodeToCollapse = this.findNode(this.hierarchyRoot, nodeName);
        nodeToCollapse.collapsed = !nodeToCollapse.collapsed;
        if (nodeToCollapse.collapsed){
            this.hideChildren(nodeToCollapse);
        } else {
            this.showChildren(nodeToCollapse);
        }
    }
}

class HierarchyNode {
    name: string
    visible: Boolean
    children: Array<HierarchyNode>
    collapsed: Boolean
    constructor(name: string, children: Array<HierarchyNode>, visible: Boolean, collapsed: Boolean){
        this.name = name;
        this.children = children;
        this.visible = visible;
        this.collapsed = collapsed;
    }
}

let hierarchyTree = new HierarchyTree(
    {
        name: "node001",
        collapsed: false,
        visible: true,
        children: [
            {
                name: "node002",
                collapsed: false,
                visible: true,
                children: [
                    {
                        name: "node004",
                        collapsed: false,
                        visible: true,
                        children: []
                    }    
                ]
            },
            {
                name: "node003",
                collapsed: false,
                visible: true,
                children: []
            }
        ]
    }
)

let hierarchyModel = new HierarchyModel(hierarchyTree);
let hierarchyView = new HierarchyView($("#div001"));
let hierarchyController = new HierarchyController(hierarchyModel, hierarchyView);