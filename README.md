#   Arpico Furniture Management System - ( Group 06 )

## Installation Instructions

To get started with this project, follow the steps below:

### Cloning the Repository

1. Copy this repository's URL.
2. Clone it into your local machine using your preferred Git client or the following command:

    ```bash
    git clone <https://github.com/Plymouth-University/main-assessment-group-06.git>
    ```

### Opening the Project in IntelliJ IDEA

1. Open IntelliJ IDEA.
2. Navigate to File -> Open.
3. Locate the folder where you cloned the repository and select it.

### Configuring Dependencies

Before using the application, you need to download the OpenGL libraries and configure them in IntelliJ IDEA. Follow these steps:

1. Download the required OpenGL libraries. If you haven't downloaded the OpenGL libraries yet, you can follow this link to download them from the official website [Jogamp](https://jogamp.org/). Navigate to Builds/Downloads under version 2.5.0, select the zip file, and download the jogamp-all-platforms.7zip.

2. After downloading, create a 'lib' and 'bin' folder in your project directory and locate the relevant files. Your 'lib' folder should contain these four libraries:
    - gluegen-rt.jar
    - gluegen-rt-natives-windows-amd64.jar
    - jogl-all.jar
    - jogl-all-natives-windows-amd64.jar

3. Additionally, your 'bin' folder should contain this library:
    - j3dcore-ogl.dll
4. In IntelliJ IDEA, go to File -> Project Structure.
5. Navigate to the Libraries tab.
6. Click on the + icon and select Java.
7. Locate and select the downloaded lib and bin folders containing the OpenGL libraries.
8. Click OK to confirm and add the libraries.

### Running the Application

To run the application:

1. Go to the Main.java file of the project.
2. Run the application.
3. You can use either "sandaru" and "123" as the username and password, or "seraan" and "123" as the username and password.

Now you're all set to use the application!


