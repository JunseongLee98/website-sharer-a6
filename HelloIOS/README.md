# HelloIOS

A simple iOS application for UW iSchool that displays a custom message with styled text.

## Project Details

- **Product Name**: HelloIOS
- **Display Name**: Hello (shown on home screen)
- **Organization Identifier**: edu.uw.ischool.yournetid (replace 'yournetid' with your UW NetID)
- **Target Device**: iPhone 15 Pro
- **iOS Version**: 17.0+

## Features

- Purple background
- White, bold, italic text displaying "Go Dawgs!"
- Label positioned in upper-left corner
- Custom font size (32pt)

## Setup Instructions

### Before Opening in Xcode

**IMPORTANT**: You must update the organization identifier before building!

1. Open `HelloIOS.xcodeproj/project.pbxproj` in a text editor
2. Find all instances of `edu.uw.ischool.yournetid` (there are 2)
3. Replace `yournetid` with your actual UW NetID
4. Save the file

### Building the Project

1. Open `HelloIOS.xcodeproj` in Xcode
2. Select "HelloIOS" scheme and "iPhone 15 Pro" simulator from the toolbar
3. Press Cmd+B to build, or Cmd+R to build and run
4. The app should display "Go Dawgs!" in white bold italic text on a purple background

### Running on a Device

1. Connect your iOS device via USB
2. In Xcode, select your device from the device menu
3. You may need to:
   - Trust the computer on your device
   - Sign the app with your Apple ID (Xcode > Preferences > Accounts)
   - In project settings, select a Development Team under Signing & Capabilities
4. Press Cmd+R to build and run on your device

## Project Structure

```
HelloIOS/
├── HelloIOS.xcodeproj/
│   └── project.pbxproj
├── HelloIOS/
│   ├── AppDelegate.swift
│   ├── SceneDelegate.swift
│   ├── ViewController.swift          # Main view with custom label
│   ├── Info.plist                    # Contains app display name "Hello"
│   ├── Base.lproj/
│   │   ├── Main.storyboard
│   │   └── LaunchScreen.storyboard
│   └── Assets.xcassets/
│       └── AppIcon.appiconset/
├── screenshots/                       # Add emulator and device screenshots here
└── README.md
```

## Customization

To change the displayed text, edit `HelloIOS/ViewController.swift` and modify the `label.text` property in the `viewDidLoad()` method. Options include:
- "Go Dawgs!"
- "Go Seahawks!"
- "Cougars suck!"

## Screenshots

Place your screenshots in the `screenshots/` directory:
- Screenshot of app running on emulator
- Photo/screenshot/video of app running on a physical device

## Troubleshooting

### Build Errors
- Make sure you've updated the organization identifier with your NetID
- Ensure you're using Xcode 15.0 or later
- Check that the iOS 17.0 SDK is installed

### Device Deployment Issues
- Enable "Developer Mode" on iOS 16+ devices (Settings > Privacy & Security)
- Trust your development certificate on the device
- Ensure your device is registered in your Apple Developer account (for free provisioning)

## Assignment Requirements Checklist

- [x] Organization identifier uses UW iSchool format
- [x] Product name is "HelloIOS"
- [x] App display name is "Hello"
- [x] Label shows one of the approved messages
- [x] Purple background with white bold italic text
- [x] Label positioned in upper-left corner
- [x] Targeted to iPhone 15 Pro
- [ ] Replace 'yournetid' with actual UW NetID
- [ ] Build succeeds
- [ ] Runs in simulator
- [ ] Runs on physical device
- [ ] Screenshot of emulator in screenshots/ directory
- [ ] Photo/screenshot of device in screenshots/ directory
- [ ] Pushed to GitHub repo named 'helloios'

## Grading Criteria

- Builds correctly: 2 pts
- Runs in emulator: 1 pt
- Runs on device: 1 pt
- App name is "Hello": 1 pt

**Total: 5 points**
