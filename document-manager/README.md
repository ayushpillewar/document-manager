## use this command to build locally

npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios
npx expo run:ios --configuration Debug
npx expo run:ios --configuration Release //for running wihout metro server on local
npx expo run:ios --device // for runnihn

## to get more out of copilot

"Act as a Senior Software Architect. Refactor or generate the following code to strictly follow SOLID principles. Single Responsibility: Ensure each class has only one reason to change. Open/Closed: Use abstractions so code is open for extension but closed for modification. Liskov Substitution: Ensure subclasses can replace their base classes without breaking behavior. Interface Segregation: Create small, specific interfaces rather than large, general-purpose ones. Dependency Inversion: Depend on abstractions (interfaces), not concrete implementations.
