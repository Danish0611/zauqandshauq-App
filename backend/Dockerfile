FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY . .

RUN mkdir -p /root/.m2 && cp settings.xml /root/.m2/settings.xml
RUN mvn -B -s settings.xml -DskipTests package

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV PORT=10000

EXPOSE 10000

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=60.0", "-XX:+UseSerialGC", "-jar", "app.jar"]
