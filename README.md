# OneFocus

<h4 align="center">A productivity application designed to help developers achieve intense focus and maximize their deep work sessions.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#built-with">Built With</a> •
  <a href="#project-status">Project Status</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#support">Support</a>
</p>

## About

OneFocus is inspired by Cal Newport's "Deep Work" principles, helping you structure your work time for optimal productivity and minimal distractions. In today's distraction-filled world, the ability to focus intensely on cognitively demanding tasks is becoming increasingly rare and increasingly valuable.

> "Deep Work: Professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit." - Cal Newport

## Key Features

* 🎯 Focused Work Sessions
  - Customizable Pomodoro timer
  - Distraction blocking
  - Work session tracking

* 🌓 Dark/Light mode
  - Easy on the eyes
  - Automatic theme switching

* 📊 Progress Tracking
  - Session statistics
  - Focus metrics
  - Productivity insights

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm
* Docker (optional, for containerized deployment)

### Installation

1. Clone this repository
```bash
git clone https://github.com/mohameddhameem/onefocus.git
```

2. Install dependencies
```bash
npm install
```

## How To Use

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Deploy with Docker

```bash
npm run build
docker build -t onefocus .
docker run -p 8080:80 onefocus
```

## Built With

* [Vue.js](https://vuejs.org/) - The web framework used
* [Vite](https://vitejs.dev/) - Frontend build tool
* [Docker](https://www.docker.com/) - Containerization

## Project Status

🚧 **Active Development** - This project is being actively developed. We're continuously working on adding new features and improvements to help you achieve better focus and productivity.

### Roadmap

- [ ] Advanced statistics dashboard
- [ ] Integration with calendar apps
- [ ] Mobile responsive design
- [ ] Custom focus profiles
- [ ] Website blocking during focus sessions

## Contributing

Your contributions are welcome and appreciated! Here's how you can contribute:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your contributions align with the project's goal of promoting focused, distraction-free work.

### Types of Contributions

* 🐛 Bug Reports
* 💡 Feature Requests
* 📝 Documentation
* 🔧 Code Improvements

## Support

* Create an [Issue](https://github.com/mohameddhameem/onefocus/issues) for bug reports and feature requests
* Star the repository if you find it useful

## Development Setup

### Recommended IDE Setup

* [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)

### Additional Configuration

For detailed configuration options, see the [Vite Configuration Reference](https://vitejs.dev/config/).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

<p align="center">
  Made with ❤️ for the love of deep work and focused development
</p>
