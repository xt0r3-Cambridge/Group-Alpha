"use strict";

/* convention:
keywords: 
    An array of arrays. Outer array denotes individual keywords, or sets of keywords. Inner array denotes keywords linked together.
    eg: [[more,consequential],[revolution]]
distance: 
    An array of integers denoting the distance linked keywords should be found together in, 0 indicates no distance (only one keyword)
    eg: [1,0] for above
text:
    array of words
    [the,cat,sat,on,the,rug]
watchlist:
    words currently looking out for, usage:
    [["Word", index, position, distance left],["Word 2", index, position, distance left]]
    -> put all first keywords into array with distance left == Infinity
    -> position == position in the keyword array array ->  is index :)
*/

/* notes:
TODO:
    HOW CALLED AND HOW RUN? -> case for all 18 pitfalls :)
    make sure no case sensitivity
    allow for alternative (american) spelling
    first keyword == first looking for, if order doesn't matter, have all possible orders in keywords array
*/ 

function findNearbyTokens(keywords,distance,tokens) {
    if(keywords.length == 0){
        return [0];
    }
    let watchlist = [];
    let keywordslen = keywords.length;
    for (let i = 0; i < keywordslen; i++){
        watchlist.push([keywords[i][0],i,0,Infinity]);                           //set up watchlist with all first keywords
    }


    let decision = new Array(keywordslen).fill(0);          //return array initialisation

    for(let i = 0; i < tokens.length; i++){               //iterate through text
        let word = tokens[i].toUpperCase();       
        for (let k = 0; k < watchlist.length; k++){         //for each word, test each keyword
            if(watchlist[k] == 0){                          //if watchlist entry == 0; that ones been done :)
                continue;
            }
            if(word == watchlist[k][0].toUpperCase()){
                let keywordIndex = watchlist[k][1];
                if(watchlist[k][2] == (keywords[keywordIndex].length-1)){                //if its the final keyword, you done, thats it! -> index of that word is the same as the final index (length -1)TODO remove from watchlist
                    decision[i] = 1;
                    watchlist[k] = 0;
                }                                           
                else{
                    console.log()
                    watchlist.push([keywords[keywordIndex][(watchlist[k][2]+1)],keywordIndex,watchlist[k][2]+1,distance[keywordIndex]]);          //put entry into watchlist of next keyword in group, and increaase position
                }
            }
            else{
                if(watchlist[k][3] == 0){                   //if no match, and distance == 0 then keyword out of scope so stop looking
                    watchlist[k] = 0;
                }
                else{
                    watchlist[k][3] -= 1;                   //else distance reduces by one
                }
            }
            //TODO -> optional: set all with the same keywordIndex to 0.
        }
        //TODO -> optional: remove finished watchlist entries.

    }

    return decision;
}




class Pitfall{

    constructor(array){
        if(array[1].length != array[2].length){
            // TODO -> work out error handling :)
        }
        this.name = array[0];           //name of pitfall
        this.keywords = array[1];       //array of array of keywords
        this.distances = array[2];      //array of distances
        this.swap = array[3];           //do i swap the answer (are we looking for negative)
    }
    

    identified(tokens) {
        let ans = findNearbyTokens(this.keywords, this.distances, tokens);
        if(this.swap){
            for(let i = 0; i < ans.length; i++){
                ans[0] = !ans;
            }
        }
        return ans;
    }

};




export function baseline(tokens){
    let decision = new Array(18).fill(0);
    let pitfalls = new Array(18);

    pitfalls[0] = new Pitfall(["Attributing agency to AI",[['TAKE','OVER'],['AI','INDEPENDENCE']],[1,6],0]);
    pitfalls[1] = new Pitfall(["Suggestive imagery",[],[],0]);
    pitfalls[2] = new Pitfall(["Comparison with human intelligence",[["HUMAN","INTELLIGENCE"],['SENTIENT']],[1,0],0]);
    pitfalls[3] = new Pitfall(["Comparison with human skills",[['AS','EFFECTIVE'],['AS','SUCCESSFULLY']],[1,1],0]);
    pitfalls[4] = new Pitfall(['Hyperbole',[['REVOLUTIONARY'],['GROUNDBREAKING']],[0,0],0]);
    pitfalls[5] = new Pitfall(['Uncritical comparison with historical transformations',[['MORE','CONSEQUENTIAL'],['REVOLUTION']],[1,0],0]);
    pitfalls[6] = new Pitfall(['Unjustified claims about future progress',[['WILL','BE','USEFUL'],['BECOME','ESSENTIAL'],['BECOME','USEFUL'],['EVENTUALLY','DEVELOP']],[1,4,4,4],0]);
    pitfalls[7] = new Pitfall(['False claims about progress',[['TEACHES','ITSELF'],['BECOMES','INDEPENDENT']],[1,5],0]);
    pitfalls[8] = new Pitfall(['Incorrect claims about what a study reports',[],[],0]);
    pitfalls[9] = new Pitfall(['Deep-sounding terms for banal actions',[['MAGIC','AI'],['ELEMENTAL'],['GODS']],[5,0,0],0]);
    pitfalls[10] = new Pitfall(['Treating company spokespeople and researchers as neutral parties',[],[],0]);
    pitfalls[11] = new Pitfall(['Repeating or re-using PR terms and statements',[],[],0]);
    pitfalls[12] = new Pitfall(['No discussion of potential limitations',[['INADEQUATE','VALIDATION'],['BIAS'],['PRIVACY','CONCERNS'],['LIMITATIONS']],[1,0,1,0],1]);
    pitfalls[13] = new Pitfall(['Limitations de-emphasized',[['INADEQUATE','VALIDATION'],['BIAS'],['PRIVACY','CONCERNS'],['LIMITATIONS']],[1,0,1,0],0]);
    pitfalls[14] = new Pitfall(['Limitations addressed in a "skeptics" framing',[['SKEPTICS'],['SOME ARGUE']],[0,1],0]);
    pitfalls[15] = new Pitfall(['Downplaying human labor',[['HUMAN','LABOUR'],['HUMAN','LABOR'],['MANUAL'],['MANUAL','LABELLING']],[1,1,0,1],1]);
    pitfalls[16] = new Pitfall(['Performance numbers reported without uncertainty estimation or caveats',[['ACCURACY','UNCERTAINTY'],['UNCERTAINTY','ACCURACY'],['ACCURACY','ERROR'],['ERROR','ACCURACY'],['PERFORMANCE','ERROR'],['ERROR','PERFORMANCE']],[8,8,8,8,8,8],1]);
    pitfalls[17] = new Pitfall(['The fallacy inscrutability',[['IMPOSSIBLE','TO','UNDERSTAND'],['INSCRUTIBLE'],['CANNOT','UNDERSTAND'],['DON\'T','UNDERSTAND']],[1,0,1,1],0]);

    for(let i = 0;i<18;i++){
        let sum = pitfalls[i].identified(tokens).reduce(function (previousValue,currentValue){return previousValue + currentValue});
        if(sum >= 1){ 
            decision[i] = 1;                                //TODO -> optional change sort conditino for different pitfalls
        }
    }
    console.log(decision);
    return decision;

}

// main(['take','over','and','eventually','could','develop',]);
