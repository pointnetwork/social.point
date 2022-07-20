const EventConstants = {
    Action : {
        Migrator: "0",
        Create: "1",
        Like: "2",
        Comment: "3",
        Edit: "4",
        Delete: "5",    
        Dislike: "6",
        Flag: "7",
    },
    Component : {
        Contract: "0",
        Feed: "1",
        Post: "2",
        Comment: "3",    
    },
    FollowAction: {
        Follow : "0",
        UnFollow : "1",
        Block : "2",
        UnBlock : "3"
    }
}

export default EventConstants;
