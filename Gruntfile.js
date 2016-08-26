module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            build: {
                src: ['public/tictactoe.js'],
                dest: 'public/tictactoe.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
};
