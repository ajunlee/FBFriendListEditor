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
        xfbml: false
    });

    FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
            _currentUid = response.authResponse.userID;
            _accessToken = response.authResponse.accessToken;
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
    jQuery("#btnLogin").bind("click", function () {
        FB.login(function (response) {
            if (response.authResponse) {
                _currentUid = response.authResponse.id;
                ShowMyInfo();
            } else {
                _currentUid = "";
                _currentUserName = "";
                ShowLoginInfo();
            }

        }, { scope: 'email,user_status,manage_friendlists,read_friendlists' });
        return false;
    });

    jQuery("#btnLogout").bind("click", function () {
        FB.logout(function (response) {
            _currentUid = "";
            _currentUserName = "";
            ShowLoginInfo();
        });
        return false;
    });

    jQuery("#btnNewList").bind("click", handlerNewList);
    jQuery("#btnDeleteList").bind("click", handlerDeleteList);
    jQuery("#btnUpdateList").bind("click", handlerUpdateList);
    jQuery("#btnFriendList").bind("click", function () {
        loadFriendLists("divFriendList");
        loadFriends("divFriend");
        return false;
    })

    $("#divMsgReceiver").droppable({
        activeClass: "ui-state-default",
        hoverClass: "ui-state-hover",
        accept: ":not(.ui-sortable-helper)",
        drop: function (event, ui) {
            var _memberId = ui.draggable.find("a").attr("id");
            var _memberName = ui.draggable.find("a").text();

            if (_memberId in _memberList) {
                ShowMessage("This user already exists");
            } else {
                jQuery("#olFriends").prepend(genMemberObj(_memberId, _memberName));
                FBAddMember(_currentListId, _memberId, _memberName);
            }
        }
    })
});

function ShowLoginInfo() {
    if (_currentUid != "") {
        jQuery("#iLogin").hide();
        jQuery("#iLogout").show();
        jQuery("#divUserInfo").show();
        jQuery("#divUserInfo").append(genProfileImg(_currentUid)).append(jQuery("<span />").text(_currentUserName));
    } else {
        jQuery("#iLogin").show();
        jQuery("#iLogout").hide();
        jQuery("#divUserInfo").html("").hide();
    }
}

function handleAuthResponseChange(response) {
    if (response.status === 'connected') {

    } else if (response.status === 'not_authorized') {

    } else {

    }
}

function handlerFriendClick() {
    _currentListId = jQuery(this).attr("id");
    _currentListName = jQuery(this).text();
    jQuery("#tbxFriendListId").val(_currentListId);
    jQuery("#tbxFriendListName").val(_currentListName);
    loadMembers();
    return false;
}

function handlerNewList() {
    var _listName = prompt("Please input the list name");
    if ((_listName !== null) && (_listName != "")) {
        FB.api("/me/friendlists", "post", { "name": _listName }, function (response) {
            if (!response || response.error) {
                ShowMessage('Error occured');
            } else {
                _currentListName = _listName;
                _currentListId = response.id;
                loadForm();
                loadMembers();
                loadFriendLists("divFriendList");
            }
        });
    }
    return false;
}
function loadForm() {
    jQuery("#tbxFriendListId").val(_currentListId);
    jQuery("#tbxFriendListName").val(_currentListName);
}
function clearForm() {
    jQuery("#tbxFriendListId").val("");
    jQuery("#tbxFriendListName").val("");
}

function handlerDeleteList() {
    if (confirm("Do you want to delete this list?")) {
        FB.api("/" + _currentListId, "delete", function (response) {
            _currentListId = "";
            _currentListName = "";
            if (!response || response.error) {
                ShowMessage('Error occured');
            } else {
                ShowMessage('list deleted');
                loadForm();
                loadFriendLists("divFriendList");
                loadMembers();
            }
        });
    }
    return false;
}
function handlerUpdateList() {
    var _listId = "";
    if (jQuery("#tbxFriendListName").val() == "") {
        alert("Please input the List Name first.");
        return;
    }
    if (jQuery("#tbxFriendListId").val() != "") {
        _listId = FBAddFList(jQuery("#tbxFriendListName").val());
        if (_listId != "") {
            ShowMessage("List Added");
        } else {
            ShowMessage("encounter some problems.");
        }
    } else {
        _listId = jQuery("#tbxFriendListId").val();
    }
}

function ShowMessage(msg) {
    jQuery("#divMsgReceiver").text(msg);
}


function FBAddMember(listId, memberId, memberName) {
    FB.api("/" + listId + "/members/" + memberId, "post", function (response) {
        if (!response || response.error) {
            ShowMessage("Add failed");
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
            ShowMessage("Delete fail");
        } else {
            ShowMessage("Deleted");
        }
    });
}
function FBAddFList(listName) {
    FB.api("/me/friendlists", "post", { "name": listName }, function (response) {
        if (!response || response.error) {
            return "";
        } else {
            return response.id;
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

function loadFriendLists(objId) {
    FB.api("/me/friendlists", function (response) {
        var _ulObj = jQuery("<ul />");
        for (var i = 0; i < response.data.length; i++) {
            var _link = jQuery("<a />").attr("id", response.data[i].id).text(response.data[i].name);
            _link.attr("href", "#");
            _link.bind("click", handlerFriendClick);
            _ulObj.append(jQuery("<li />").append(_link));
        }
        jQuery("#" + objId).html("");
        jQuery("#" + objId).append(_ulObj);
    });
}

function loadMembers() {
    if (_currentListId != "") {
        _memberList = {};
        FB.api("/" + _currentListId + "/members", function (response) {
            var _ulObj = jQuery("#olFriends");
            _ulObj.html("");
            for (var i = 0; i < response.data.length; i++) {
                _ulObj.append(genMemberObj(response.data[i].id, response.data[i].name));
                _memberList[response.data[i].id] = response.data[i].name;
            }
        });
    } else {
        var _ulObj = jQuery("#olFriends");
        _ulObj.html("");
    }
}

function loadFriends(objId) {
    FB.api("/me/friends", function (response) {
        var _ulObj = jQuery("<ul />");
        for (var i = 0; i < response.data.length; i++) {
            var _iObj = jQuery("<li />");
            var _link = jQuery("<a />").attr("id", response.data[i].id).text(response.data[i].name);
            _link.attr("href", "#");
            _iObj.append(genProfileImg(response.data[i].id));
            _iObj.append(_link);
            _ulObj.append(_iObj);
        }
        jQuery("#" + objId).html("");
        jQuery("#" + objId).append(_ulObj);

        $("#" + objId + " li").draggable({ revert: true,
            cursor: "move"
        });
    });
}

function genProfileImg(userId) {
    return jQuery("<img width=\"40\" />").attr("src", 'https://graph.facebook.com/' + userId + '/picture?type=square');
}
function genMemberObj(memberId, memberName) {
    var _liObj = jQuery("<li class=\"span2\" />");
    var _link = jQuery("<a />").attr("id", memberId).text(memberName);
    var _delIcon = jQuery("<a href=\"#\" class=\"pull-right\"><i class=\"icon-remove\"></i></a>").bind("click", function () {
        var _memberId = jQuery(this).parent().find("a").attr("id");
        if (_memberId != "") {
            FBDeleteMember(_currentListId, _memberId);
            jQuery(this).parent().remove();
        }
    });
    _liObj.append(genProfileImg(memberId));
    _liObj.append(_link);
    _liObj.append(_delIcon);
    return _liObj
}