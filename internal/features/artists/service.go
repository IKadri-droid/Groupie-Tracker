package artists

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"groupie/internal/core"
	"net/http"
	"net/url"
)

// DATABASE ACCESS
func GetConcertsByArtistID(artistID int) ([]Concert, error) {
	query := `SELECT id, artist_id, location, date, latitude, longitude, image_concert, venue, price, available_seats 
	          FROM concerts WHERE artist_id = $1`
	rows, err := core.DB.Query(query, artistID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var concerts []Concert
	for rows.Next() {
		var c Concert
		var dateStr string
		var venue, price, concertImg sql.NullString
		var availableSeats sql.NullInt32
		if err := rows.Scan(&c.ID, &c.ArtistID, &c.Location, &dateStr, &c.Latitude, &c.Longitude, &concertImg, &venue, &price, &availableSeats); err != nil {
			continue
		}
		c.Date = dateStr
		if concertImg.Valid {
			c.ConcertImage = concertImg.String
		}
		if venue.Valid {
			c.Venue = venue.String
		}
		if price.Valid {
			c.Price = price.String
		}
		if availableSeats.Valid {
			c.AvailableSeats = int(availableSeats.Int32)
		}
		concerts = append(concerts, c)
	}
	return concerts, nil
}

func getJSON(url string, target interface{}) error {
	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "GroupieTracker/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("deezer api error: %d", resp.StatusCode)
	}

	return json.NewDecoder(resp.Body).Decode(target)
}

// DEEZER LOGIC
func GetDeezerArtist(name string) (DeezerArtist, error) {
	apiURL := fmt.Sprintf("https://api.deezer.com/search/artist?q=%s", url.QueryEscape(name))
	var res DeezerResponse
	if err := getJSON(apiURL, &res); err != nil {
		return DeezerArtist{}, err
	}
	if len(res.Data) == 0 {
		return DeezerArtist{}, fmt.Errorf("aucun artiste trouvé")
	}
	return res.Data[0], nil
}

func GetDeezerAlbums(artistID int) ([]DeezerAlbum, error) {
	apiURL := fmt.Sprintf("https://api.deezer.com/artist/%d/albums", artistID)
	var res DeezerAlbumsResponse
	if err := getJSON(apiURL, &res); err != nil {
		return nil, err
	}
	return res.Data, nil
}

func GetDeezerTopTracks(artistID int) ([]DeezerTrack, error) {
	apiURL := fmt.Sprintf("https://api.deezer.com/artist/%d/top", artistID)
	var res DeezerTracksResponse
	if err := getJSON(apiURL, &res); err != nil {
		return nil, err
	}
	return res.Data, nil
}
