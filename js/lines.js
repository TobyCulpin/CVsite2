//calls images() on window resize event, which updates the images
window.addEventListener("resize", images);

//variable is a string
function setCssVar(variable, value)
{
    document.documentElement.style.setProperty(variable, value);
}
function getCssVar(variable)
{
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
}

//returns what border a line from the center intersects given an angle
function borderIntersect(angle)
{
    screenInfo = updateScreenInfo();
    //critical angles pointing to the corners
    let alpha = Math.atan(screenInfo.wPix/screenInfo.hPix);

    let ca0 = 0             + alpha;
    let ca1 = Math.PI       - alpha;
    let ca2 = Math.PI       + alpha;
    let ca3 = (2 * Math.PI) - alpha;

    if ((angle >= 0) && (angle < ca0))//top border
    {
        return 0;
    }
    else if ((angle >= ca0) && (angle < ca1))
    {
        return 1;
    }
    else if ((angle >= ca1) && (angle < ca2))
    {
        return 2;
    }
    else if ((angle >= ca2) && (angle < ca3))
    {
        return 3;
    }
    else if ((angle > ca3) && (angle <= (2 * Math.PI)))
    {
        return 4;
    }
}

//Creates the line elements and sets the rotationa and position
function lines()
{
    for (i = 0; i < parseInt(getCssVar(`--sections`)); i++)
    {
        //creates line elements
        let line = document.createElement(`DIV`);

        //set attributes
        line.classList.add(`lines`);

        let angle = ((i * 2 * Math.PI) / parseInt(getCssVar(`--sections`))).toString() + `rad`;
        let distance = `-500vh`;
        line.style.transform = `rotate(${angle}) translateY(${distance})`;

        //adds element to body
        document.body.appendChild(line);
    }
}

//returns width and height based on the line sectors
//width and height are preformatted as strings with vw and vh
function getImgSize(lineInfo)
{
    let imgWidth = `50vw`;//Defaults
    let imgHeight = `50vh`;

    if (lineInfo.l1Sector == lineInfo.l2Sector)//checks if the containing lines are in the same sector
    {
        //set image to be a quater of the screen
        imgWidth = `50vw`;
        imgHeight = `50vh`;
    }
    else if ((lineInfo.l1Sector == 0 && lineInfo.l2Sector == 1) ||    //for tall image on left
             (lineInfo.l1Sector == 0 && lineInfo.l2Sector == 2) ||    //for tall image on left where there are only 2 sections
             (lineInfo.l1Sector == 2 && lineInfo.l2Sector == 3))      //for tall image on right
    {
        //set image to be a half of the screen (tall and thin)
        imgWidth = `50vw`;
        imgHeight = `100vh`;
    }
    else if ((lineInfo.l1Sector == 1 && lineInfo.l2Sector == 2))  //for wide image on bottom
    {                                           //no wide image on top is possible as the first line is always in the middle at the top
        //set image to be half of the screen (wide and short)
        imgWidth = `100vw`;
        imgHeight = `50vh`;
    }

    return{
        w: imgWidth,
        h: imgHeight
    };
}

//returns the right and bottom based on line sectors
//right and bottom are preformatted as strings with vw and vh
function getImgPositions(lineInfo)
{
    //Defaults
    let imgRight = `0vw`;
    let imgBottom = `0vh`;

    if (lineInfo.l1Sector == 0 && lineInfo.l2Sector == 0)         //in sector 1
    {
        imgRight = `0vw`;
        imgBottom = `50vh`;
    }
    else if ((lineInfo.l1Sector == 0 && lineInfo.l2Sector == 1) ||//in sector 1 and 2
             (lineInfo.l1Sector == 0 && lineInfo.l2Sector == 2) ||//in sector 1 and 2     for when there are exactly 2 sections
             (lineInfo.l1Sector == 1 && lineInfo.l2Sector == 1) ||//in sector 2
             (lineInfo.l1Sector == 1 && lineInfo.l2Sector == 2))  //in sector 2 and 3
    {
        imgRight = `0vw`;
        imgBottom = `0vh`;
    }
    else if ((lineInfo.l1Sector == 2 && lineInfo.l2Sector == 2) ||//in sector 3
             (lineInfo.l1Sector == 2 && lineInfo.l2Sector == 3))  //in sector 3 and 4
    {
        imgRight = `50vw`;
        imgBottom = `0vh`;
    }
    else if (lineInfo.l1Sector == 3 && lineInfo.l2Sector == 3)    //in sector 4
    {
        imgRight = `50vw`;
        imgBottom = `50vh`;
    }

    return{
        r: imgRight,
        b: imgBottom
    };
}

//returns the clip path of the image based on screen and line info
//returns path as a string in format `polygon(a% b%, c% d%, ...)`
function getImgShape(lineInfo, screenInfo)
{
    if      (lineInfo.l1Border == 0 && lineInfo.l2Border == 0 &&    //Border 0 only
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 0)       //Sector 0 only
            {
                let v1 = (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle) / screenInfo.wPix).toString() + `%`;
                let v2 = (100 * screenInfo.hPix * Math.tan(lineInfo.l2angle) / screenInfo.wPix).toString() + `%`;
                
                return `polygon(0% 100%, ${v1} 0%, ${v2} 0%)`;
            }
    else if (lineInfo.l1Border == 0 && lineInfo.l2Border == 1 &&    //Border 0 and 1
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 0)       //Sector 0 only
            {
                let v1 = (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle) / screenInfo.wPix).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.wPix * Math.tan( (Math.PI / 2) - lineInfo.l2angle) / screenInfo.hPix)).toString() + `%`

                return `polygon(0% 100%, ${v1} 0%, 100% 0%, 100% ${v2})`;
            }
    else if (lineInfo.l1Border == 0 && lineInfo.l2Border == 1 &&    //Border 0 and 1
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 1)       //Sector 0 and 1
            {
                let v1 = (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle) / screenInfo.wPix).toString() + `%`;
                let v2 = (50 + (50 * screenInfo.wPix * Math.tan(lineInfo.l2angle - (Math.PI / 2)) / screenInfo.hPix)).toString() + `%`

                return `polygon(0% 50%, ${v1} 0%, 100% 0%, 100% ${v2})`;
            }
    else if (lineInfo.l1Border == 0 && lineInfo.l2Border == 2 &&    //Border 0 and 2
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 1)       //Sector 0 and 1
            {
                let v1 = (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle) / screenInfo.wPix).toString() + `%`;
                let v2 = (100 * screenInfo.hPix * Math.tan( Math.PI - lineInfo.l2angle) / screenInfo.wPix).toString() + `%`;

                return `polygon(0% 50%, ${v1} 0%, 100% 0%, 100% 100%, ${v2} 100%)`;
            }
    else if (lineInfo.l1Border == 0 && lineInfo.l2Border == 2 &&    //Border 0 and 2
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 2)       //Sector 0 and 2    sections = 2 case only
            {
                return `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)`;
            }
    else if (lineInfo.l1Border == 1 && lineInfo.l2Border == 1 &&    //Border 1 only
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 0)       //Sector 0 only
            {
                let v1 = (100 - (100 * screenInfo.wPix * Math.tan( (Math.PI / 2) - lineInfo.l1angle) / screenInfo.hPix)).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.wPix * Math.tan( (Math.PI / 2) - lineInfo.l2angle) / screenInfo.hPix)).toString() + `%`;
                
                return `polygon(0% 100%, 100% ${v1}, 100% ${v2})`;
            }
    else if (lineInfo.l1Border == 1 && lineInfo.l2Border == 1 &&    //Border 1 only
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 1)       //Sector 0 and 1
            {
                let v1 = (50 - (50 * screenInfo.wPix * Math.tan( (Math.PI / 2) - lineInfo.l1angle) / screenInfo.hPix)).toString() + `%`;
                let v2 = (50 + (50 * screenInfo.wPix * Math.tan(lineInfo.l2angle - (Math.PI / 2) ) / screenInfo.hPix)).toString() + `%`;
                
                return `polygon(0% 50%, 100% ${v1}, 100% ${v2})`;
            }
    else if (lineInfo.l1Border == 1 && lineInfo.l2Border == 2 &&    //Border 1 and 2
            lineInfo.l1Sector == 0 && lineInfo.l2Sector == 1)       //Sector 0 and 1
            {
                let v1 = (50 - (50 * screenInfo.wPix * Math.tan( (Math.PI / 2) - lineInfo.l1angle) / screenInfo.hPix)).toString() + `%`;
                let v2 = (100 * screenInfo.hPix * Math.tan( Math.PI - lineInfo.l2angle) / screenInfo.wPix).toString() + `%`;

                return `polygon(0% 50%, 100% ${v1}, 100% 100%, ${v2} 100%)`;
            }
    else if (lineInfo.l1Border == 1 && lineInfo.l2Border == 1 &&    //Border 1 only
            lineInfo.l1Sector == 1 && lineInfo.l2Sector == 1)       //Sector 1 only
            {
                let v1 = (100 * screenInfo.wPix * Math.tan(lineInfo.l1angle - (Math.PI / 2)) / screenInfo.hPix).toString() + `%`;
                let v2 = (100 * screenInfo.wPix * Math.tan(lineInfo.l2angle - (Math.PI / 2)) / screenInfo.hPix).toString() + `%`;
                
                return `polygon(0% 0%, 100% ${v1}, 100% ${v2})`;
            }
    else if (lineInfo.l1Border == 1 && lineInfo.l2Border == 2 &&    //Border 1 and 2
            lineInfo.l1Sector == 1 && lineInfo.l2Sector == 1)       //Sector 1 only
            {
                let v1 = (100 * screenInfo.wPix * Math.tan(lineInfo.l1angle - (Math.PI / 2)) / screenInfo.hPix).toString() + `%`;
                let v2 = (100 * screenInfo.hPix * Math.tan(Math.PI - lineInfo.l2angle) / screenInfo.wPix).toString() + `%`;

                return `polygon(0% 0%, 100% ${v1}, 100% 100%, ${v2} 100%)`;
            }
    else if (lineInfo.l1Border == 1 && lineInfo.l2Border == 2 &&    //Border 1 and 2
            lineInfo.l1Sector == 1 && lineInfo.l2Sector == 2)       //Sector 1 and 2
            {
                let v1 = (100 * screenInfo.wPix * Math.tan(lineInfo.l1angle - (Math.PI / 2)) / screenInfo.hPix).toString() + `%`;
                let v2 = (50 - (50 * screenInfo.hPix * Math.tan(lineInfo.l2angle - Math.PI) / screenInfo.wPix)).toString() + `%`;

                return `polygon(50% 0%, 100% ${v1}, 100% 100%, ${v2} 100%)`;
            }
    else if (lineInfo.l1Border == 1 && lineInfo.l2Border == 3 &&    //Border 1 and 3
            lineInfo.l1Sector == 1 && lineInfo.l2Sector == 2)       //Sector 1 and 2
            {
                let v1 = (100 * screenInfo.wPix * Math.tan(lineInfo.l1angle - (Math.PI / 2)) / screenInfo.hPix).toString() + `%`;
                let v2 = (100 * screenInfo.wPix * Math.tan((3 * Math.PI / 2) - lineInfo.l2angle) / screenInfo.hPix).toString() + `%`;

                return `polygon(50% 0%, 100% ${v1}, 100% 100%, 0% 100%, 0% ${v2})`;
            }
    else if (lineInfo.l1Border == 2 && lineInfo.l2Border == 2 &&    //Border 2 only
            lineInfo.l1Sector == 1 && lineInfo.l2Sector == 1)       //Sector 1 only
            {
                let v1 = (100 * screenInfo.hPix * Math.tan(Math.PI - lineInfo.l1angle) / screenInfo.wPix).toString() + `%`;
                let v2 = (100 * screenInfo.hPix * Math.tan(Math.PI - lineInfo.l2angle) / screenInfo.wPix).toString() + `%`;

                return `polygon(0% 0%, ${v1} 100%, ${v2} 100%)`;
            }
    else if (lineInfo.l1Border == 2 && lineInfo.l2Border == 2 &&    //Border 2 only
            lineInfo.l1Sector == 1 && lineInfo.l2Sector == 2)       //Sector 1 and 2
            {
                let v1 = (50 + (50 * screenInfo.hPix * Math.tan(Math.PI - lineInfo.l1angle) / screenInfo.wPix)).toString() + `%`;
                let v2 = (50 - (50 * screenInfo.hPix * Math.tan(lineInfo.l2angle - Math.PI) / screenInfo.wPix)).toString() + `%`;

                return `polygon(50% 0%, ${v1} 100%, ${v2} 100%)`;
            }
    else if (lineInfo.l1Border == 2 && lineInfo.l2Border == 2 &&    //Border 2 only
            lineInfo.l1Sector == 2 && lineInfo.l2Sector == 2)       //Sector 2 only
            {
                let v1 = (100 - (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle - Math.PI) / screenInfo.wPix)).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.hPix * Math.tan(lineInfo.l2angle - Math.PI) / screenInfo.wPix)).toString() + `%`;

                return `polygon(100% 0%, ${v1} 100%, ${v2} 100%)`;
            }
    else if (lineInfo.l1Border == 2 && lineInfo.l2Border == 3 &&    //Border 2 and 3
            lineInfo.l1Sector == 2 && lineInfo.l2Sector == 2)       //Sector 2 only
            {
                let v1 = (100 - (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle - Math.PI) / screenInfo.wPix)).toString() + `%`;
                let v2 = (100 * screenInfo.wPix * Math.tan( (3 * Math.PI / 2) - lineInfo.l2angle) / screenInfo.hPix).toString() + `%`;
                
                return `polygon(100% 0%, ${v1} 100%, 0% 100%, 0% ${v2})`;
            }
    else if (lineInfo.l1Border == 2 && lineInfo.l2Border == 3 &&    //Border 2 and 3
            lineInfo.l1Sector == 2 && lineInfo.l2Sector == 3)       //Sector 2 and 3
            {
                let v1 = (100 - (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle - Math.PI) / screenInfo.wPix)).toString() + `%`;
                let v2 = (50 - (50 * screenInfo.wPix * Math.tan(lineInfo.l2angle - (3 * Math.PI / 2) ) / screenInfo.hPix)).toString() + `%`;
                
                return `polygon(100% 50%, ${v1} 100%, 0% 100%, 0% ${v2})`;
            }
    else if (lineInfo.l1Border == 2 && lineInfo.l2Border == 4 &&    //Border 2 and 4
            lineInfo.l1Sector == 2 && lineInfo.l2Sector == 3)       //Sector 2 and 3
            {
                let v1 = (100 - (100 * screenInfo.hPix * Math.tan(lineInfo.l1angle - Math.PI) / screenInfo.wPix)).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.hPix * Math.tan( (2 * Math.PI) - lineInfo.l2angle) / screenInfo.wPix)).toString() + `%`;
                
                return `polygon(100% 50%, ${v1} 100%, 0% 100%, 0% 0%, ${v2} 0%)`;
            }
    else if (lineInfo.l1Border == 3 && lineInfo.l2Border == 3 &&    //Border 3 only
            lineInfo.l1Sector == 2 && lineInfo.l2Sector == 2)       //Sector 2 only
            {
                let v1 = (100 * screenInfo.wPix * Math.tan( (3 * Math.PI / 2) - lineInfo.l1angle) / screenInfo.hPix).toString() + `%`;
                let v2 = (100 * screenInfo.wPix * Math.tan( (3 * Math.PI / 2) - lineInfo.l2angle) / screenInfo.hPix).toString() + `%`;

                return `polygon(100% 0%, 0% ${v1}, 0% ${v2})`;
            }
    else if (lineInfo.l1Border == 3 && lineInfo.l2Border == 3 &&    //Border 3 only
            lineInfo.l1Sector == 2 && lineInfo.l2Sector == 3)       //Sector 2 and 3
            {
                let v1 = (50 + (50 * screenInfo.wPix * Math.tan( (3 * Math.PI / 2) - lineInfo.l1angle) / screenInfo.hPix)).toString() + `%`;
                let v2 = (50 - (50 * screenInfo.wPix * Math.tan(lineInfo.l2angle - (3 * Math.PI / 2) ) / screenInfo.hPix)).toString() + `%`;

                return `polygon(100% 50%, 0% ${v1}, 0% ${v2})`;
            }
    else if (lineInfo.l1Border == 3 && lineInfo.l2Border == 4 &&    //Border 3 and 4
            lineInfo.l1Sector == 2 && lineInfo.l2Sector == 3)       //Sector 2 and 3
            {
                let v1 = (50 + (50 * screenInfo.wPix * Math.tan( (3 * Math.PI / 2) - lineInfo.l1angle) / screenInfo.hPix)).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.hPix * Math.tan( (2 * Math.PI) - lineInfo.l2angle) / screenInfo.wPix)).toString() + `%`;

                return `polygon(100% 50%, 0% ${v1}, 0% 0%, ${v2} 0%)`;
            }
    else if (lineInfo.l1Border == 3 && lineInfo.l2Border == 3 &&    //Border 3 only
            lineInfo.l1Sector == 3 && lineInfo.l2Sector == 3)       //Sector 3 only
            {
                let v1 = (100 - (100 * screenInfo.wPix * Math.tan(lineInfo.l1angle - (3 * Math.PI / 2) ) / screenInfo.hPix)).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.wPix * Math.tan(lineInfo.l2angle - (3 * Math.PI / 2) ) / screenInfo.hPix)).toString() + `%`;

                return `polygon(100% 100%, 0% ${v1}, 0% ${v2})`;
            }
    else if (lineInfo.l1Border == 3 && lineInfo.l2Border == 4 &&    //Border 3 and 4
            lineInfo.l1Sector == 3 && lineInfo.l2Sector == 3)       //Sector 3 only
            {
                let v1 = (100 - (100 * screenInfo.wPix * Math.tan(lineInfo.l1angle - (3 * Math.PI / 2) ) / screenInfo.hPix)).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.hPix * Math.tan( (2 * Math.PI) - lineInfo.l2angle) / screenInfo.wPix)).toString() + `%`;

                return `polygon(100% 100%, 0% ${v1}, 0% 0%, ${v2} 0%)`;
            }
    else if (lineInfo.l1Border == 4 && lineInfo.l2Border == 4 &&    //Border 4 only
            lineInfo.l1Sector == 3 && lineInfo.l2Sector == 3)       //Sector 3 only
            {
                let v1 = (100 - (100 * screenInfo.hPix * Math.tan( (2 * Math.PI) - lineInfo.l1angle) / screenInfo.wPix)).toString() + `%`;
                let v2 = (100 - (100 * screenInfo.hPix * Math.tan( (2 * Math.PI) - lineInfo.l2angle) / screenInfo.wPix)).toString() + `%`;

                return `polygon(100% 100%, ${v1} 0%, ${v2} 0%)`;
            }
            
}

//sets the size, position, and shape for the line images


//sets the size, position, and shape for the line images
function images()
{
    screenInfo = updateScreenInfo();
    lineImages = document.getElementsByClassName(`lineImg`);
    
    for (i = 0; i < lineImages.length; i++)
    {
        //line info object
        let lineInfo = updateLineInfo();
        //Set image dimensions---------------------------------------------------------------------------------

        dimensions = getImgSize(lineInfo);
        //updates the css
        lineImages[i].style.width = `${dimensions.w}`;
        lineImages[i].style.height = `${dimensions.h}`;
        //-----------------------------------------------------------------------------------------------------

        //Set image positions----------------------------------------------------------------------------------

        positions = getImgPositions(lineInfo);

        //update the css
        lineImages[i].style.right = `${positions.r}`;
        lineImages[i].style.bottom = `${positions.b}`;
        //-----------------------------------------------------------------------------------------------------

        //Set image shape--------------------------------------------------------------------------------------

        path = getImgShape(lineInfo, screenInfo);
        // if (i == 0) alert(path);
        lineImages[i].style.clipPath = `${path}`;
        //lineImages[i].style.webkitClipPath = `${path}`;
    }
}



function updateScreenInfo()
{
    return {
        //main view width and height in pixels
        wPix: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        hPix: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    };
}

function updateLineInfo()
{
    return {
        //finds what sector the line is in
        //top right is 0, moving clockwise      0,1,2,3
        l1Sector: Math.floor((i * 4) / parseInt(getCssVar(`--sections`))),
        l2Sector: Math.min(3, Math.floor(((i + 1) * 4) / parseInt(getCssVar(`--sections`)))),
        //get angle of the 2 lines in radians
        l1angle: ((i * 2 * Math.PI) / parseInt(getCssVar(`--sections`))),
        l2angle: (((i + 1) * 2 * Math.PI) / parseInt(getCssVar(`--sections`))),
        //what border the lines intersect       top border is split into 0 and 4
        //top right is 0, moving clockwise      0,1,2,3,4
        l1Border: borderIntersect(/*l1angle*/((i * 2 * Math.PI) / parseInt(getCssVar(`--sections`)))),
        l2Border: borderIntersect(/*l2angle*/(((i + 1) * 2 * Math.PI) / parseInt(getCssVar(`--sections`))))
    };
}


//Creates the line elements and sets the rotationa and position
lines();

//sets the size, position, and shape for the line images
images();