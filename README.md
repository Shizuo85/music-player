# Music-player
A music player api that allows a user to upload songs and make a playlist out of them
 
#Link to postman documentation: 
https://documenter.getpostman.com/view/20417456/2s83zgujzs

### Endpoints
The following endpoints are available on this server:
- `/users/sigup`: registers a new user.
- `/users/login`: logs in a user.
- `/users/logout`: logs out a user(protected route).
- `/users/forgotPassword`: to get reset password url.
- `/users/resetPassword/:token`: to reset password.
- `/library/uploadMusic`: to upload songs to your library
- `/library/getLibrary`: to get all songs in the library
- `/library/deleteMusic`: to delete a song from the library
- `/library/changeName`: to change the name of a song in the library
- `/playlist/createPlaylist`: to create a playlist
- `/playlist/getPlaylist`: to get all available playlists
- `/playlist/addToPlaylist`: to add a song to a playlist
- `/playlist/removeFromPlaylist`: to remove a song from a playlist
- `/playlist/populatePlaylist`: to retrive all songs from a playlist
- `/playlist/deletePlaylist`: to delete a playlist


