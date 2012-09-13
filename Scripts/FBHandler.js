var _currentUid = "";
var _currentUserName = "";
var _accessToken = "";
var _memberList = {};
var _currentListId = "";
var _currentListName = "";

window.fbAsyncInit = function () {
    FB.init({
        appId: _appId,
        channelUrl: _channelFile,
        status: true,
        cookie: true,
        xfbml: true
    });

    FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
            _currentUid = response.authResponse.userID;
            _accessToken = response.authResponse.accessToken;
            loadFriendLists();
            loadFriends();
            ShowMyInfo();
        } else {
            ShowLoginInfo();
        }
    });
};

(function (d) {
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
} (document));

jQuery(document).ready(function () {
    jQuery("#btnLogin").bind("click", handlerLogin);
    jQuery("#btnMLogin").bind("click", handlerLogin);
    jQuery("#btnLogout").bind("click", handlerLogout);
    jQuery("#btnNewList").bind("click", handlerNewList);
    jQuery("#btnDeleteList").bind("click", handlerDeleteList);
    jQuery("#btnUpdateList").bind("click", handlerUpdateList);
    jQuery("#btnFriendList").bind("click", handlerFriendList);

    $("#divMsgReceiver").droppable({
        activeClass: "ui-state-default",
        hoverClass: "ui-state-hover",
        accept: ":not(.ui-sortable-helper)",
        drop: function (event, ui) {
            if (_currentListId != "") {
                var _memberId = ui.draggable.find("a").attr("id");
                var _memberName = ui.draggable.find("a").text();

                if (_memberId in _memberList) {
                    ShowMessage("This user already exists");
                } else {
                    jQuery("#olFriends").prepend(genMemberObj(_memberId, _memberName, true));
                    FBAddMember(_currentListId, _memberId, _memberName);
                }
            } else {
                alert("Please pick one list or create a new one first.");
            }
        }
    })
});

function ShowLoginInfo() {
    if (_currentUid != "") {
        jQuery("#iLogout").show();
        jQuery("#divUserInfo").html("");
        jQuery("#divUserInfo").append(genProfileImg(_currentUid,_currentUserName)).show();
        jQuery("#loginPanel").hide();
        jQuery("#editPanel").show();
    } else {
        jQuery("#iLogout").hide();
        jQuery("#divUserInfo").html("").hide();
        jQuery("#loginPanel").show();
        jQuery("#editPanel").hide();
    }
}

function handleAuthResponseChange(response) {
    if (response.status === 'connected') {

    } else if (response.status === 'not_authorized') {

    } else {

    }
}
function handlerLogin() {
    FB.login(function (response) {
        if (response.authResponse) {
            _currentUid = response.authResponse.id;
            loadFriendLists();
            loadFriends();
            ShowMyInfo();
        } else {
            _currentUid = "";
            _currentUserName = "";
            ShowLoginInfo();
        }

    }, { scope: 'email,user_status,manage_friendlists,read_friendlists' });
    return false;
}
function handlerLogout() {
    FB.logout(function (response) {
        _currentUid = "";
        _currentUserName = "";
        _currentListId = "";
        _currentListName = "";
        loadForm();
        loadFriendLists();
        loadFriends();
        loadMembers();
        ShowLoginInfo();
    });
    return false;
}
function handlerFriendList() {
    loadFriendLists();
    loadFriends();
    return false;
}
function handlerFriendListClick() {
    _currentListId = jQuery(this).attr("id");
    _currentListName = jQuery(this).text();
    loadForm();
    loadMembers();
    ShowMessage("drag and drop your friend to here.");
    return false;
}

function handlerNewList() {
    var _listName = prompt("Please input the list name");
    if ((_listName !== null) && (_listName != "")) {
        _currentListId = "";
        _currentListName = _listName;
        FBUpdateFList(_listName);
    }
    return false;
}
function loadForm() {
    jQuery("#lblListName").text("List Name : " + _currentListName);
}

function handlerDeleteList() {
    if (confirm("Do you want to delete this list?")) {
        FBDeleteFList(_currentListId,"","");
    }
    return false;
}
function handlerUpdateList() {
    var _listName = prompt("Please input the list name");
    if (_listName == "") {
        alert("Please input the List Name first.");
    } else {
        FBUpdateFList(_listName);
    }
    return;
}

function ShowMessage(msg) {
    jQuery("#divMsgReceiver").text(msg);
}


function FBAddMember(listId, memberId, memberName) {
    FB.api("/" + listId + "/members/" + memberId, "post", function (response) {
        if (!response || response.error) {
            ShowMessage(response.error.message);
        } else {
            _memberList[memberId] = memberName;
            ShowMessage("Added");
        }
    });
}
function FBDeleteMember(listId, userId) {
    delete _memberList[userId];
    FB.api("/" + listId + "/members/" + userId, "delete", function (response) {
        if (!response || response.error) {
            ShowMessage(response.error.message);
        } else {
            ShowMessage("Deleted");
        }
    });
}
function FBUpdateFList(listName) {
    FB.api("/me/friendlists", "post", { "name": listName }, function (response) {
        if (!response || response.error) {
            ShowMessage(response.error.message);
        } else {
            var _listId = response.id;
            if (_currentListId != "") {
                //Can't find the update method in FB API,
            	//so, change the update to copy...
            	//TODO : add those members to this list.
                for (var mbr in _memberList) {
                    FBAddMember(_listId, mbr, _memberList[mbr]);
                }
                ShowMessage("List Updated");
            } else {
                ShowMessage("List Added");
            }
            _currentListId = _listId;
            _currentListName = listName;
            loadForm();
            loadMembers();
            loadFriendLists();
        }
    });
}
function FBDeleteFList(listId,newListId,newListName) {
    FB.api("/" + listId, "delete", function (response) {
        if (!response || response.error) {
            ShowMessage(response.error.message);
        } else {
            _currentListId = newListId;
            _currentListName = newListName;
            ShowMessage('list deleted');
            loadForm();
            loadFriendLists();
            loadMembers();
        }
    });
}
function ShowMyInfo() {
    FB.api('/me', function (response) {
        _currentUid = response.id;
        _currentUserName = response.name;
        ShowLoginInfo();
    });
}

function loadFriendLists() {
    jQuery("#divFriendList").html("");
    if (_currentUid != "") {
        FB.api("/me/friendlists", function (response) {
            var _ulObj = jQuery("<ul />");
            for (var i = 0; i < response.data.length; i++) {
                var _link = jQuery("<a />").attr("id", response.data[i].id).text(response.data[i].name);
                _link.attr("href", "#");
                _link.bind("click", handlerFriendListClick);
                _ulObj.append(jQuery("<li />").append(_link));
            }
            jQuery("#divFriendList").html("");
            jQuery("#divFriendList").append(_ulObj);
        });
    }
}

function loadMembers() {
    var _ulObj = jQuery("#olFriends");
    _ulObj.html("");
    if (_currentListId != "") {
        _memberList = {};
        FB.api("/" + _currentListId + "/members", function (response) {
            for (var i = 0; i < response.data.length; i++) {
                _ulObj.append(genMemberObj(response.data[i].id, response.data[i].name,true));
                _memberList[response.data[i].id] = response.data[i].name;
            }
        });
    }
}

function loadFriends() {
    jQuery("#divFriend").html("");
    if (_currentUid != "") {
        FB.api("/me/friends", function (response) {
            var _ulObj = jQuery("<ul />");
            for (var i = 0; i < response.data.length; i++) {
                _ulObj.append(genMemberObj(response.data[i].id, response.data[i].name,false));
            }
            jQuery("#divFriend").append(_ulObj);
            $("#divFriend li").draggable({ revert: true,
                cursor: "move"
            });
        });
    }
}

function genProfileImg(userId,userName) {
    var _img = jQuery("<img width=\"40\" alt=\"" + userName + "\" title=\"" + userName + "\" />").attr("src", 'https://graph.facebook.com/' + userId + '/picture?type=square');
    return _img;
}

function genMemberObj(memberId, memberName, showDelIcon) {
    var _liObj = jQuery("<li class=\"span2\" />");
    var _link = jQuery("<a />").attr("id", memberId).text(memberName);
    _liObj.append(genProfileImg(memberId,memberName));
    _liObj.append(_link);
    if (showDelIcon) {
        var _delIcon = jQuery("<a href=\"#\" class=\"pull-right\"><i class=\"icon-remove\"></i></a>").bind("click", function () {
            var _memberId = jQuery(this).parent().find("a").attr("id");
            if (_memberId != "") {
                FBDeleteMember(_currentListId, _memberId);
                jQuery(this).parent().remove();
            }
        });
        _liObj.append(_delIcon);
    }
    return _liObj
}