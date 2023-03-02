function getTitle(){
    var title = document.title;
    if (title.endsWith("/ Twitter")){
        title = title.replace('/ Twitter','');
    }else if (title.endWith("- The New York Times")){
        title = title.replace('- The New York Times','');
    }else if (title.endWith("| Reuters")){
        title = title.replace('| Reuters','');
    }else if (title.endWith("- BBC News")){
        title = title.replace('- BBC News','');
    }
    return title
}