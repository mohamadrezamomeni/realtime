module.exports = (roomID, user) => {
    return user.RoomAccess.some(item => item.RoomID === roomID);
};