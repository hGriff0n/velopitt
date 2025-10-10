# Velopitt

NOTE: This site is a very early alpha/demo and I am not a front-end engineer.

The intention with this project is to provide a regional resource into Pittsburgh-area cycling that would be particularly useful to new residents or visitors. That is, to answer the question of where to ride, how to ride, when, and with who?

For the most part, especially in the current iteration, the way I've chosen to break down this problem is by focusing on "Segments of Interest" instead of providing explicit routes. For one, the question of "what **is** a good route" is a very interesting question about intent and ability that's not all that generalizable (and I generally avoid riding the same route anyways). But for another, I think focusing on this grab-bag approach provides a toolkit for riders to navigate the area allowing them to explore or not at their leisure.

Another concept the current site explores is the idea of "cycling zones" which is a way of grouping the geographical areas based on riding "commonalities" - for example, you don't go to the river trails if you want really steep climbing. This is explicitly not tied to any official neighborhood/city boundaries, but merely a separate way of organizing the region from a cyclist's perspective. The alpha sketches out a couple zones but these are even more deserving of the "alpha" label than the UI.

My favorite feature at the moment is another overlay that displays all cycling infrastructure (based on BikePGH resources) and an overlay that is a hand-drawn sketch of the Bike+ plan. The overlay onto a 3D terrain map, really brings the network to life and can be very useful at helping to plan in the future.

Unfortunately, the current alpha design of the site is basically the limits of my UI and web abilities. In addition, I've recently gotten interested in other projects and don't have the time to contribute to feature development, particularly the development of the community resources. I think the current site is a good demonstration of potential, so I'm going to be releasing it to the PGH community in the hope of broader development.


# Developmental Details

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
