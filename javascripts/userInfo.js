async function init(){
    await loadIdentity();
    loadUserInfo();
}

async function saveUserInfo(){
    const bio = document.getElementById("bio-input").value;
    const favoriteColor = document.getElementById("favoriteColor-input").value;
    const website = document.getElementById("website-input").value;
    const statusElement = document.getElementById("save-status");

    try {
        statusElement.innerText = "Saving...";
        await fetchJSON(`api/${apiVersion}/users/info`, {
            method: "PUT",
            body: {
                bio: bio,
                favoriteColor: favoriteColor,
                website: website
            }
        });
        statusElement.innerText = "Saved successfully!";
        statusElement.style.color = "green";
        // Reload user info to display updated values
        loadUserInfo();
    } catch (error) {
        statusElement.innerText = "Error saving information";
        statusElement.style.color = "red";
        console.error("Error saving user info:", error);
    }
}

async function loadUserInfo(){
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if(username==myIdentity){
        document.getElementById("username-span").innerText= `You (${username})`;
        document.getElementById("user_info_new_div").classList.remove("d-none");
        
    }else{
        document.getElementById("username-span").innerText=username;
        document.getElementById("user_info_new_div").classList.add("d-none");
    }
    
    // Load user info from the database
    try {
        const userInfoJson = await fetchJSON(`api/${apiVersion}/users/info?username=${encodeURIComponent(username)}`);
        const userInfo = userInfoJson.userInfo;

        // Display user info
        document.getElementById("bio-display").innerText = userInfo.bio || "No bio provided";
        document.getElementById("favoriteColor-display").innerText = userInfo.favoriteColor || "Not specified";
        
        const websiteDisplay = document.getElementById("website-display");
        if (userInfo.website) {
            websiteDisplay.href = userInfo.website;
            websiteDisplay.innerText = userInfo.website;
        } else {
            websiteDisplay.href = "#";
            websiteDisplay.innerText = "No website provided";
        }

        // If viewing own profile, populate edit form
        if (username == myIdentity) {
            document.getElementById("bio-input").value = userInfo.bio || "";
            document.getElementById("favoriteColor-input").value = userInfo.favoriteColor || "";
            document.getElementById("website-input").value = userInfo.website || "";
        }
    } catch (error) {
        console.error("Error loading user info:", error);
        document.getElementById("bio-display").innerText = "Error loading bio";
        document.getElementById("favoriteColor-display").innerText = "Error loading favorite color";
        document.getElementById("website-display").innerText = "Error loading website";
    }

    loadUserInfoPosts(username)
}


async function loadUserInfoPosts(username){
    document.getElementById("posts_box").innerText = "Loading...";
    let postsJson = await fetchJSON(`api/${apiVersion}/posts?username=${encodeURIComponent(username)}`);
    let postsHtml = postsJson.map(postInfo => {
        return `
        <div class="post">
            ${escapeHTML(postInfo.description)}
            ${postInfo.htmlPreview}
            <div><a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">${escapeHTML(postInfo.username)}</a>, ${escapeHTML(postInfo.created_date)}</div>
            <div class="post-interactions">
                <div>
                    <span title="${postInfo.likes? escapeHTML(postInfo.likes.join(", ")) : ""}"> ${postInfo.likes ? `${postInfo.likes.length}` : 0} likes </span> &nbsp; &nbsp; 
                </div>
                <br>
                <div><button onclick='deletePost("${postInfo.id}")' class="${postInfo.username==myIdentity ? "": "d-none"}">Delete</button></div>
            </div>
        </div>`
    }).join("\n");
    document.getElementById("posts_box").innerHTML = postsHtml;
}


async function deletePost(postID){
    let responseJson = await fetchJSON(`api/${apiVersion}/posts`, {
        method: "DELETE",
        body: {postID: postID}
    })
    loadUserInfo();
}
