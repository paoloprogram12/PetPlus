# PetPlus

A mobile app for managing your pets and tracking their daily care. Built with React Native and Expo.

## Features

### My Pets
- Add pets with a name, type (Dog, Cat, Bird, Fish, Rabbit, Hamster, Other), and age
- Edit existing pet details
- Delete pets with a confirmation prompt
- Floating "+" button for quick access to add a new pet

### Log Care
- Select a pet and log a care activity: **Feeding**, **Walk**, or **Medication**
- Add an optional note to each entry (e.g., "Fed 2 cups of kibble")
- Tasks are automatically timestamped with the current date

### Today (Calendar View)
- **Calendar date strip** at the top shows a full week (Mon–Sun)
- Navigate between weeks using the `<` and `>` arrows
- Tap any day to view tasks logged on that date
- Selected date is highlighted in orange; today's label is also distinguished
- Month name displayed above the week strip
- Mark tasks as complete/incomplete with a tap on the checkbox
- Completed tasks show a green checkmark and strikethrough text

## Tech Stack

- **React Native** with **Expo**
- **React Navigation** — bottom tabs + stack navigator
- **AsyncStorage** — local on-device data persistence
- **Ionicons** — icon library

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Expo Go](https://expo.dev/go) app on your phone (for testing on a real device)

### Install & Run

```bash

# Install dependencies
npm install

# Start the development server
npm start
```

Once the server starts, you can:
- Scan the QR code with **Expo Go** (Android) or the Camera app (iOS)
- Press `i` to open in the iOS Simulator
- Press `a` to open in an Android Emulator
- Press `w` to open in a web browser

## Project Structure

```
PetPlus/
  App.jsx                  # Root component — sets up navigation (tabs + stack)
  index.js                 # Entry point — registers the app
  src/
    screens/
      PetListScreen.jsx    # List of all pets with add/edit/delete
      AddPetScreen.jsx     # Form to add or edit a pet
      LogCareScreen.jsx    # Log a care task for a pet
      TodayScreen.jsx      # Calendar strip + task list for a selected date
    store/
      PetStore.js          # Data layer — load/save/create/filter pets & tasks
```
