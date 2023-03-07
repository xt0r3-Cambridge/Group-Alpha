function getTitle(){

    /*
        Get Titles from what the user is seeing.
        However, some webpages don't have titles in their posts, for example, Facebook
    */

    var title = document.title; // get title from the webpage

    if (title.endsWith("/ Twitter")){ // the webpage is Twitter
    
        title = title.replace('/ Twitter','');

    }else if (title.endWith("- The New York Times")){ // the webpage is New York Times

        title = title.replace('- The New York Times','');

    }else if (title.endWith("| Reuters")){ // the webpage is Reuters

        title = title.replace('| Reuters','');

    }else if (title.endWith("- BBC News")){ // the webpage is BBC News

        title = title.replace('- BBC News','');

    } // the rest webpages

    return title
}