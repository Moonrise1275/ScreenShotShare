var uuid = require("uuid");

var MASTER = 5, VICE_MASTER = 4, MEMBER = 3, SUB_MEMBER = 2, GUEST = 1, BAN = 0;

var MAX_COMM_PER_PERSON = 5;

function createCommunity(master, name, irc, channel, dbhandler, callback) {
    dbhandler.selectWith('communities', 'WHERE master = "' + master + '";', function(array) {
        if (array.length >= MAX_COMM_PER_PERSON) {
            if(typeof callback === 'function') callback(false, 'You cannot make communities more then ' + MAX_COMM_PER_PERSON);
        } else {
            var commid = uuid.v4();
            if (channel.indexOf('#') !== 0) channel = '#' + channel;
            dbhandler.insert('communities', {'ind':0,'commid':commid,'name':name,'master':master,'ircserver':irc,'channel':channel,'gwatch':GUEST,'gsay':GUEST,'gmember':VICE_MASTER,'gcomm':MASTER});
            dbhandler.insert('members', {'ind':0,'commid':commid,'userid':master,'grade':MASTER});
            if (typeof callback === 'function') callback(true, 'Successfully made a new community ' + name + ' in ' + commid);
        }
    });
}

function disbandCommunity(who, id, dbhandler, callback) {
    dbhandler.selectWith('communities', 'WHERE commid = "' + id + '"', function(array) {
        if (array.length < 1) {
            if(typeof callback === 'function') callback(false, 'There\'s no such community.');
        } else {
            var community = array[0];
            var name = community.name;
            if (community.master != who) {
                if(typeof callback === 'function') callback(false, 'Only master can disband community');
            } else {
                dbhandler.remove('communities', 'commid = "' + id + '";');
                dbhandler.remove('members', 'commid = "' + id + '";');
                if(typeof callback === 'function') callback(true, 'Your community ' + name + ' is successfully disbanded!');
            }
        }
    });
}

function addMember(who, commid, newbie, dbhandler, callback) {
    basic(who, commid, dbhandler, callback, function(community, trier) {
       if (trier.grade < community.gmember) {
           if(typeof callback === 'function') callback(false, 'You cannot add a new member to this community.');
       } else {
           dbhandler.insert('members', {'ind':0,'commid':commid,'userid':newbie,'grade':MEMBER});
           if(typeof callback === 'function') callback(true, 'New member is successfully added to this community!');
       }
    });
}

function setMemberPosition(who, commid, target, pos, dbhandler, callback) {
    if (pos > VICE_MASTER) pos = VICE_MASTER;
    else if (pos < BAN) pos = BAN;
    basic(who, commid, dbhandler, callback, function(community, trier) {
        if (trier.grade < community.gmember) {
            if(typeof callback === 'function') callback(false, 'You cannot modify member\'s information of this community');
        } else if(trier.grade < pos) {
            if(typeof callback === 'function') callback(false, 'You cannot set member\'s position higher then your\'s');
        } else {
            dbhandler.selectWith('members', 'WHERE commid = "' + commid + '" AND userid = "' + target + '";', function(array) {
               if (array.length < 1) {
                   if(typeof callback === 'function') callback(false, 'There\'s no such user in this community');
               } else {
                   dbhandler.update('members', 'grade', pos, 'commid = "' + commid + '" AND userid = "' + target + '";');
                   if(typeof callback === 'function') callback(true, 'Successfully updated user\'s grade');
               }
            });
        }
    });
}

function removeMember(who, commid, target, dbhandler, callback) {
    basic(who, commid, dbhandler, callback, function(community, trier) {
        if (trier.grade < community.gmember) {
            if(typeof callback === 'function') callback(false, 'You cannot remove member from this community');
        } else {
            dbhandler.remove('members', 'WHERE commid = "' + commid + '" AND userid = "' + target + '";');
            if(typeof callback === 'function') callback(true, 'Successfully removed the member!');
        }
    });
}

function changeCommName(who, commid, newname, dbhandler, callback) {
    basic(who, commid, dbhandler, callback, function(community, trier) {
       if (trier.grade < community.gcomm) {
           if(typeof callback === 'function') callback(false, 'You cannot modify community\'s information');
       } else {
           dbhandler.update('communities', 'name', newname, 'commid = "' + commid + '";');
           if(typeof callback === 'function') callback(true, 'Successfully renamed this community');
       }
    });
}

function basic(who, commid, dbhandler, callback, func) {
    dbhandler.selectWith('communities', 'WHERE commid = "' + commid + '";', function(array) {
        if (array.length < 1) {
            if(typeof callback === 'function') callback(false, 'There\'s no such community.');
        } else {
            var community = array[0];
            dbhandler.selectWith('members', 'WHERE commid = "' + commid + '" AND userid = "' + who + '";', function(array2) {
               if (array2.length < 1) {
                   if(typeof callback === 'function') callback(false, 'You\'re not even a member of this community!');
               } else {
                   var trier = array2[0];
                   if (typeof func === 'function') func(community, trier);
               }
            });
        }
    });
}

exports.createCommunity = createCommunity;
exports.disbandCommunity = disbandCommunity;
exports.addMember = addMember;
exports.setMemberPosition = setMemberPosition;
exports.removeMember = removeMember;
exports.changeCommName = changeCommName;