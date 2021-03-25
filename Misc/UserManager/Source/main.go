package main

import (
	"bufio"
	"crypto"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"flag"
	"fmt"
	"os"
	"strings"

	_ "github.com/lib/pq"
	_ "golang.org/x/crypto/blake2s"
)

var (
	help    bool
	dbHost  string
	dbPort  int
	dbName  string
	dbUser  string
	dbPass  string
	scanner *bufio.Scanner
)

func main() {
	flag.BoolVar(&help, "h", false, "show help information")
	flag.StringVar(&dbHost, "host", "localhost", "database host to which to connect")
	flag.IntVar(&dbPort, "port", 5432, "database port to which to connect")
	flag.StringVar(&dbName, "db", "raceday", "name of the database to which to connect")
	flag.StringVar(&dbUser, "user", "postgres", "username with which to connect to the database")
	flag.StringVar(&dbPass, "password", "", "password with which to connect to the database")

	flag.Parse()

	if help {
		flag.PrintDefaults()
		os.Exit(1)
	}

	dbPassString := ""
	if dbPass != "" {
		dbPassString = fmt.Sprintf("password=%s", dbPass)
	}

	connStr := fmt.Sprintf(
		"host=%s port=%d dbname=%s user=%s%s sslmode=disable",
		dbHost,
		dbPort,
		dbName,
		dbUser,
		dbPassString,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	defer db.Close()

	scanner = bufio.NewScanner(os.Stdin)

	fmt.Println("Define a new user:")
	fmt.Println()

	username := prompt("Username:        ")
	password := prompt("Password:        ")
	passwordAgain := prompt("Retype password: ")
	firstName := prompt("First Name:      ")
	lastName := prompt("Last Name:       ")
	email := prompt("E-mail:          ")

	fmt.Println("")

	if username == "" || password == "" {
		fmt.Println("No username or password specified.")
		os.Exit(1)
	}

	if password != passwordAgain {
		fmt.Println("Passwords do not match.")
		os.Exit(1)
	}

	hashedPassword, salt, err := hashPassword(password)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	_, err = db.Exec(
		`INSERT INTO system_user (
			 id,
             password_hash,
			 salt,
			 first_name,
			 last_name,
			 email,
			 when_created
		 )
		 VALUES (
		     $1,
		     $2,
		     $3,
			 $4,
			 $5,
			 $6,
			 current_timestamp
		 )`,
		username,
		hashedPassword,
		salt,
		firstName,
		lastName,
		email,
	)
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func hashPassword(password string) (*string, *string, error) {
	b := make([]byte, 10)
	_, err := rand.Read(b)
	if err != nil {
		return nil, nil, err
	}

	salt := hex.EncodeToString(b)

	hasher := crypto.BLAKE2s_256.New()
	hasher.Write([]byte(password + salt))

	passwordHash := hex.EncodeToString(hasher.Sum(nil))

	return &passwordHash, &salt, nil
}

func prompt(message string) string {
	ret := ""

	for {
		fmt.Print(message)
		scanner.Scan()
		ret = strings.TrimSpace(scanner.Text())

		if ret != "" {
			break
		}
	}

	return ret
}
